DROP POLICY "Chiunque puo aggiornare una sessione" ON public.research_sessions;
DROP POLICY "Chiunque puo inviare una sessione" ON public.research_sessions;
REVOKE UPDATE ON public.research_sessions FROM anon, authenticated;

CREATE POLICY "Invio sessione completata valida"
  ON public.research_sessions FOR INSERT
  WITH CHECK (
    length(btrim(participant_id)) BETWEEN 1 AND 120
    AND length(btrim(context)) BETWEEN 1 AND 120
    AND length(context_custom) <= 500
    AND jsonb_typeof(payload) = 'object'
    AND pg_column_size(payload) < 200000
    AND ended_at >= started_at
  );