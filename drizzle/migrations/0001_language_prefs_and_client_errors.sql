ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recording_languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS output_language text,
  ADD COLUMN IF NOT EXISTS language_setup_done boolean NOT NULL DEFAULT false;

CREATE TABLE public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  page text NOT NULL,
  last_action text,
  message text NOT NULL,
  stack text,
  source text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.client_errors TO authenticated, anon;
GRANT SELECT ON public.client_errors TO authenticated;
GRANT ALL ON public.client_errors TO service_role;
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "log own errors" ON public.client_errors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "log anonymous errors" ON public.client_errors FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "read own errors" ON public.client_errors FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX client_errors_created_idx ON public.client_errors (created_at DESC);