-- Invitees may only acknowledge acceptance, never retarget an invitation.
REVOKE UPDATE ON public.invites FROM authenticated;
GRANT UPDATE (accepted) ON public.invites TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_invitation_acceptance()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.accepted AND NOT NEW.accepted THEN
    RAISE EXCEPTION 'An accepted invitation cannot be reopened' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_invitation_acceptance() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_invitation_acceptance BEFORE UPDATE ON public.invites
FOR EACH ROW EXECUTE FUNCTION public.guard_invitation_acceptance();

DROP POLICY "creator becomes admin" ON public.company_members;
CREATE POLICY "creator or pending invite joins" ON public.company_members
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND c.created_by = auth.uid())
    OR (member_role = 'member' AND EXISTS (
      SELECT 1 FROM public.invites i
      WHERE i.company_id = company_members.company_id
        AND lower(i.email) = lower(auth.jwt()->>'email')
        AND NOT i.accepted
    ))
  )
);

-- Consume invitations in the same transaction as membership creation.
CREATE OR REPLACE FUNCTION public.consume_membership_invitation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id = auth.uid() THEN
    UPDATE public.invites SET accepted = true
    WHERE company_id = NEW.company_id
      AND lower(email) = lower(auth.jwt()->>'email')
      AND NOT accepted;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_membership_invitation() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER consume_membership_invitation AFTER INSERT ON public.company_members
FOR EACH ROW EXECUTE FUNCTION public.consume_membership_invitation();