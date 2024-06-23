import { expect, test } from "bun:test";
import { createCursor } from "./cursor";

test("cursor iterator", () => {
  const cursor = createCursor("kyle");

  let result = "";

  for (const char of cursor) {
    result += char;
  }

  expect(result).toBe("kyle");
});

test("cursor peek", () => {
  const cursor = createCursor("kyle");

  expect(cursor.peek()).toBe("k");

  expect(cursor.position).toBe(0);
});

test("cursor remaining", () => {
  const cursor = createCursor("kyle");

  expect(cursor.remaining).toBe(4);

  for (const _ of cursor) {
  }

  expect(cursor.remaining).toBe(0);
});

test("cursor empty", () => {
  const cursor = createCursor("");
  expect(cursor.remaining).toBe(0);
  expect(cursor.next()).toStrictEqual({
    value: undefined,
    done: true,
  });
});
