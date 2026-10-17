CREATE OR REPLACE FUNCTION public.guard_company_references()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  row_data jsonb := to_jsonb(NEW);
  ref_id uuid;
  ref_column text;
  ref_table text;
  valid_reference boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    RAISE EXCEPTION 'Records cannot move between companies' USING ERRCODE = '42501';
  END IF;
  FOR ref_column, ref_table IN
    SELECT * FROM (VALUES
      ('department_id','departments'), ('role_id','roles'),
      ('source_input_id','inputs'), ('existing_item_id','knowledge_items'),
      ('from_item','knowledge_items'), ('to_item','knowledge_items')
    ) AS refs(column_name, table_name)
  LOOP
    ref_id := (row_data->>ref_column)::uuid;
    IF ref_id IS NOT NULL THEN
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I WHERE id = $1 AND company_id = $2)', ref_table)
        INTO valid_reference USING ref_id, NEW.company_id;
      IF NOT valid_reference THEN
        RAISE EXCEPTION 'Related records must belong to the same company' USING ERRCODE = '42501';
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_company_references() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_company_references BEFORE INSERT OR UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.guard_company_references();
CREATE TRIGGER guard_company_references BEFORE INSERT OR UPDATE ON public.invites FOR EACH ROW EXECUTE FUNCTION public.guard_company_references();
CREATE TRIGGER guard_company_references BEFORE INSERT OR UPDATE ON public.inputs FOR EACH ROW EXECUTE FUNCTION public.guard_company_references();
CREATE TRIGGER guard_company_references BEFORE INSERT OR UPDATE ON public.knowledge_items FOR EACH ROW EXECUTE FUNCTION public.guard_company_references();
CREATE TRIGGER guard_company_references BEFORE INSERT OR UPDATE ON public.knowledge_links FOR EACH ROW EXECUTE FUNCTION public.guard_company_references();
CREATE TRIGGER guard_company_references BEFORE INSERT OR UPDATE ON public.change_requests FOR EACH ROW EXECUTE FUNCTION public.guard_company_references();