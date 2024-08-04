import { expect, test } from "bun:test";
import type { Abi, AbiFunction } from "abitype";
import { compileAbi } from "./abiCompiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const getAbi = (source: string): { name: string; abi: Abi } => {
  return compileAbi(parse(tokenize(source)));
};

test("compileAbi() contract", () => {
  const { name, abi } = getAbi("contract C { }");
  expect(name).toBe("C");
  expect(abi).toHaveLength(0);
});

test("compileAbi() variable definition", () => {
  const { name, abi } = getAbi(`
contract C {
    uint256 x;
}`);

  expect(name).toBe("C");
  expect(abi).toHaveLength(1);
  expect(abi[0]!.type).toBe("function");
  expect((abi[0]! as AbiFunction).name).toBe("x");
  expect((abi[0]! as AbiFunction).outputs).toStrictEqual([{ type: "uint256" }]);
});
