import { expect, test } from "bun:test";
import { concatIterator, emptyIterator, mapIterator } from "./iterator";

function* iterator1() {
  yield 1;
  yield 2;
  yield 3;
}

function* iterator2() {
  yield 4;
  yield 5;
}

function drainIterator<T>(iterator: Iterable<T>): T[] {
  const results: T[] = [];
  for (const result of iterator) {
    results.push(result);
  }

  return results;
}

test("empty iterator", () => {
  const emptyResult = drainIterator(emptyIterator());

  expect(emptyResult).toStrictEqual([]);
});

test("map iterator", () => {
  const mappedResult = drainIterator(mapIterator(iterator1(), (x) => x + 1));

  expect(mappedResult).toStrictEqual([2, 3, 4]);
});

test("concat iterator", () => {
  const concatResult = drainIterator(concatIterator(iterator1(), iterator2()));

  expect(concatResult).toStrictEqual([1, 2, 3, 4, 5]);
});
