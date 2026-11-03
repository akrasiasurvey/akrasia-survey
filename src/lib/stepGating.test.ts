import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { getMaxUnlockedLevel } from "./stepGating";
import { DIMENSIONS, useResearchStore } from "../store/research";

const session = {
  consent: true, participantId: "test", context: "home", contextCustom: "",
  positions: [], continuumTouched: [], narrativesSeen: 0,
};

describe("Avanzamento con almeno una voce, senza vincoli per sezione", () => {
  test("zero voci mantiene bloccato lo Step 2", () => {
    assert.equal(getMaxUnlockedLevel(session), 2);
  });
  test("una sola voce consente lo Step 2, ma richiede il continuum", () => {
    assert.equal(getMaxUnlockedLevel({ ...session, positions: [{ id: "one" }] }), 3);
  });
  test("nessun limite massimo di voci", () => {
    assert.equal(getMaxUnlockedLevel({ ...session, positions: Array.from({ length: 100 }, (_, i) => ({ id: String(i) })) }), 3);
  });
  test("resta obbligatoria la visione delle dieci affermazioni", () => {
    const mapped = { ...session, positions: [{ id: "one" }], continuumTouched: ["one"] };
    assert.equal(getMaxUnlockedLevel({ ...mapped, narrativesSeen: 8 }), 4);
    assert.equal(getMaxUnlockedLevel({ ...mapped, narrativesSeen: 9 }), 5);
  });
  test("l'importanza assegna i raggi della scala alla mappa", () => {
    useResearchStore.getState().resetSession();
    for (const dim of DIMENSIONS) {
      useResearchStore.getState().addPosition({ label: dim.label, belonging: "internal", dimension: dim.key, radius: dim.radius });
    }
    assert.deepEqual(useResearchStore.getState().positions.map((p) => p.radius), [6, 10, 16, 22, 28, 34, 42]);
    const first = useResearchStore.getState().positions[0];
    assert.ok(first);
    useResearchStore.getState().updatePositionDimension(first.id, "centrale");
    assert.equal(useResearchStore.getState().positions[0]?.radius, 42);
  });
  test("anche una mappa vuota viene archiviata", () => {
    useResearchStore.getState().resetSession();
    useResearchStore.setState({ participantId: "empty-test", context: "home", consent: true, archivedProfiles: [] });
    useResearchStore.getState().archiveAndComplete();
    assert.equal(useResearchStore.getState().sessionCompleted, true);
    assert.deepEqual(useResearchStore.getState().archivedProfiles[0]?.positions, []);
  });
});