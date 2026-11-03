import { describe, expect, test } from "bun:test";
import { getMaxUnlockedLevel } from "./stepGating";
import { useResearchStore } from "../store/research";

const session = {
  consent: true, participantId: "test", context: "home", contextCustom: "",
  positions: [], continuumTouched: [], narrativesSeen: 0,
};

describe("Avanzamento senza limiti di voci", () => {
  test("zero voci consente lo Step 2", () => {
    expect(getMaxUnlockedLevel(session)).toBe(4);
  });
  test("una sola voce consente lo Step 2, ma richiede il continuum", () => {
    expect(getMaxUnlockedLevel({ ...session, positions: [{ id: "one" }] })).toBe(3);
  });
  test("nessun limite massimo di voci", () => {
    expect(getMaxUnlockedLevel({ ...session, positions: Array.from({ length: 100 }, (_, i) => ({ id: String(i) })) })).toBe(3);
  });
  test("resta obbligatoria la visione delle dieci affermazioni", () => {
    expect(getMaxUnlockedLevel({ ...session, narrativesSeen: 8 })).toBe(4);
    expect(getMaxUnlockedLevel({ ...session, narrativesSeen: 9 })).toBe(5);
  });
  test("anche una mappa vuota viene archiviata", () => {
    useResearchStore.getState().resetSession();
    useResearchStore.setState({ participantId: "empty-test", context: "home", consent: true, archivedProfiles: [] });
    useResearchStore.getState().archiveAndComplete();
    expect(useResearchStore.getState().sessionCompleted).toBe(true);
    expect(useResearchStore.getState().archivedProfiles[0]?.positions).toEqual([]);
  });
});