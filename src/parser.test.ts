import { test } from "bun:test";
import { parse } from "./parser.js";

test("", () => {
  const program = parse(`
  uint256 x = 0;
  uint256 y = x + 1;   
`);
});
