import { test } from "node:test";
import { strict as assert } from "node:assert";
import { computeLayout } from "../components/SelfGraph";
import { DIMENSIONS, type IPosition } from "../store/research";

test("Step 1 layout preserves seven radii and belonging bounds with numerous voices", () => {
  const voices: IPosition[] = Array.from({ length: 28 }, (_, i) => {
    const dimension = DIMENSIONS[i % 7];
    return { id: String(i), label: `Voce ${i}`, belonging: i < 14 ? "internal" : "external", dimension: dimension.key, radius: dimension.radius };
  });
  const result = computeLayout(voices, true);
  assert.equal(result.length, 28);
  result.forEach((node, i) => {
    assert.equal(node.radius, voices[i]?.radius);
    assert.equal(node.dimension, voices[i]?.dimension);
    const distance = Math.hypot(node.x - 310, node.y - 310);
    if (node.belonging === "internal") assert.ok(distance + node.radius <= 170 + 0.001);
    else { assert.ok(distance - node.radius >= 170); assert.ok(distance + node.radius <= 290 + 0.001); }
  });
  assert.ok(result.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)));
  assert.ok(voices.every((node) => !("x" in node)), "layout does not mutate saved voices");
});