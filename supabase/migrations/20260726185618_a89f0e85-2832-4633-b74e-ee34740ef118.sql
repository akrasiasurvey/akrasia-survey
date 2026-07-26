CREATE POLICY "Eliminazione sessioni dalla dashboard ricercatore"
ON public.research_sessions
FOR DELETE
TO anon, authenticated
USING (true);

GRANT DELETE ON public.research_sessions TO anon, authenticated;