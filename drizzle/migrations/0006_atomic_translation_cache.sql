CREATE OR REPLACE FUNCTION public.cache_item_translation(item_id uuid, reading_language text, expected_title text, expected_body text, translated_value jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE affected integer;
BEGIN
 IF reading_language NOT IN ('ml','hi','ta') OR jsonb_typeof(translated_value) <> 'object' OR coalesce(translated_value->>'title','') = '' OR coalesce(translated_value->>'body','') = '' THEN RAISE EXCEPTION 'Invalid translation'; END IF;
 UPDATE public.knowledge_items SET translations = coalesce(translations, '{}'::jsonb) || jsonb_build_object(reading_language, translated_value) WHERE id = item_id AND title = expected_title AND body = expected_body AND status = 'active';
 GET DIAGNOSTICS affected = ROW_COUNT;
 RETURN affected = 1;
END; $$;
REVOKE ALL ON FUNCTION public.cache_item_translation(uuid,text,text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cache_item_translation(uuid,text,text,text,jsonb) TO authenticated, service_role;