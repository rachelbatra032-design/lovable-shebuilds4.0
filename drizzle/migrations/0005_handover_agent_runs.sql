CREATE TABLE public.agent_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES public.companies(id),
 role_id uuid NOT NULL REFERENCES public.roles(id),
 created_by uuid NOT NULL,
 task text NOT NULL CHECK (task IN ('plan','audit')),
 status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','failed')),
 summary text,
 created_at timestamptz NOT NULL DEFAULT now(),
 finished_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read agent runs" ON public.agent_runs FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "members start own runs" ON public.agent_runs FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND public.is_company_member(company_id) AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.company_id = agent_runs.company_id));
CREATE POLICY "members finish own runs" ON public.agent_runs FOR UPDATE TO authenticated USING (created_by = auth.uid() AND public.is_company_member(company_id)) WITH CHECK (created_by = auth.uid() AND public.is_company_member(company_id) AND EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.company_id = agent_runs.company_id));