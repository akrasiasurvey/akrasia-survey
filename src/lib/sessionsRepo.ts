import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Context, Profile } from "@/store/research";

/**
 * Archivio permanente delle sessioni (Lovable Cloud).
 * Il profilo completo viene serializzato in `payload` per non vincolare
 * lo schema alla struttura interna dello store.
 */

type Row = {
  participant_id: string;
  context: string;
  context_custom: string | null;
  started_at: string;
  ended_at: string;
  payload: unknown;
};

function rowToProfile(r: Row): Profile {
  const p = (r.payload ?? {}) as Partial<Profile>;
  return {
    ...(p as Profile),
    participantId: r.participant_id,
    context: r.context as Context,
    contextCustom: r.context_custom ?? "",
    startedAt: new Date(r.started_at).getTime(),
    endedAt: new Date(r.ended_at).getTime(),
    demo: false,
  };
}

export async function saveProfileRemote(profile: Profile): Promise<void> {
  const startedAt = profile.startedAt ?? Date.now();
  const endedAt = profile.endedAt ?? Date.now();
  const { error } = await supabase.from("research_sessions").insert({
    participant_id: profile.participantId,
    context: profile.context,
    context_custom: profile.contextCustom ?? "",
    started_at: new Date(startedAt).toISOString(),
    ended_at: new Date(Math.max(endedAt, startedAt)).toISOString(),
    payload: profile as unknown as Json,
  });
  // 23505 = sessione già inviata con lo stesso identificativo: non è un errore
  // bloccante per il partecipante.
  if (error && error.code !== "23505") throw error;
}

export async function fetchProfilesRemote(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("research_sessions")
    .select("participant_id, context, context_custom, started_at, ended_at, payload")
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToProfile(r as Row));
}

/**
 * Elimina definitivamente una sessione dall'archivio cloud.
 * Restituisce il numero di righe effettivamente rimosse dal database.
 */
export async function deleteProfileRemote(participantId: string): Promise<number> {
  const { data, error } = await supabase
    .from("research_sessions")
    .delete()
    .eq("participant_id", participantId)
    .select("participant_id");
  if (error) {
    console.error("[sessionsRepo] delete fallita", error);
    throw error;
  }
  return data?.length ?? 0;
}
