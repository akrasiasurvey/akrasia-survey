CREATE TABLE public.research_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id text NOT NULL UNIQUE,
  context text NOT NULL,
  context_custom text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.research_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.research_sessions TO authenticated;
GRANT ALL ON public.research_sessions TO service_role;

ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chiunque puo leggere le sessioni di ricerca"
  ON public.research_sessions FOR SELECT
  USING (true);

CREATE POLICY "Chiunque puo inviare una sessione"
  ON public.research_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Chiunque puo aggiornare una sessione"
  ON public.research_sessions FOR UPDATE
  USING (true) WITH CHECK (true);