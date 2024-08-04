import { expect, test } from "bun:test";
import type { Hex } from "viem";
import { compile } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const getCode = (source: string): Hex => {
  return compile(parse(tokenize(source)));
};

test("", () => {
  const code = getCode(`
contract C {
  function run() external {
    uint256 x = 10;
    uint256 y = x;
  }
}`);

  expect(code).not.toBe("0x");
});
