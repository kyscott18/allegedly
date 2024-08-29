import { expect, test } from "bun:test";
import path from "node:path";
import { frame } from "./frame";

const source = await Bun.file(path.join(import.meta.dir, "..", "_sol", "SimpleStorage.sol")).text();

console.log(
  frame(
    source,
    {
      start: { line: 4, offset: 4 },
      end: {
        line: 4,
        offset: 11,
      },
    },
    "sup",
  ),
);
