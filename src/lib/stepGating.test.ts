import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { getMaxUnlockedLevel } from "./stepGating";
import { useResearchStore } from "../store/research";

const session = {
  consent: true, participantId: "test", context: "home", contextCustom: "",
  positions: [], continuumTouched: [], narrativesSeen: 0,
};

describe("Avanzamento senza limiti di voci", () => {
  test("zero voci consente lo Step 2", () => {
    assert.equal(getMaxUnlockedLevel(session), 4);
  });
  test("una sola voce consente lo Step 2, ma richiede il continuum", () => {
    assert.equal(getMaxUnlockedLevel({ ...session, positions: [{ id: "one" }] }), 3);
  });
  test("nessun limite massimo di voci", () => {
    assert.equal(getMaxUnlockedLevel({ ...session, positions: Array.from({ length: 100 }, (_, i) => ({ id: String(i) })) }), 3);
  });
  test("resta obbligatoria la visione delle dieci affermazioni", () => {
    assert.equal(getMaxUnlockedLevel({ ...session, narrativesSeen: 8 }), 4);
    assert.equal(getMaxUnlockedLevel({ ...session, narrativesSeen: 9 }), 5);
  });
  test("anche una mappa vuota viene archiviata", () => {
    useResearchStore.getState().resetSession();
    useResearchStore.setState({ participantId: "empty-test", context: "home", consent: true, archivedProfiles: [] });
    useResearchStore.getState().archiveAndComplete();
    assert.equal(useResearchStore.getState().sessionCompleted, true);
    assert.deepEqual(useResearchStore.getState().archivedProfiles[0]?.positions, []);
  });
});