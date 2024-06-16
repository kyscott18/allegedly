import { expect, test } from "bun:test";
import { createCursor } from "./cursor";

test("cursor gets next word", () => {
  const cursor = createCursor("kyle");

  const word = cursor.read();

  expect(word).toBe("kyle");
});
