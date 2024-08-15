import { expect, test } from "bun:test";
import { EVM } from "@ethereumjs/evm";
import { hexToBytes } from "viem";
import { compile } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const getCode = async (source: string) => {
  const evm = await EVM.create();
  const code = compile(parse(tokenize(source)));
  const result = await evm.runCode({ code: hexToBytes(code) });

  return { code, result };
};

test.skip("empty block", async () => {
  const { result, code } = await getCode(`
contract C {
  function run() external {
  }
}`);

  console.log(code);

  console.log(result.runState?.stack);

  expect(code).not.toBe("0x");
});

test("literal", async () => {
  const { result } = await getCode(`
contract C {
  function run() external {
    10;
  }
}`);

  expect(result.exceptionError).toBeUndefined();
});

test("literal assignment", async () => {
  const { result } = await getCode(`
contract C {
  function run() external {
    uint256 x = 10;
  }
}`);

  expect(result.exceptionError).toBeUndefined();
});

test("identifier", async () => {
  const { result } = await getCode(`
contract C {
  function run() external {
    uint256 x = 10;
    x;
  }
}`);

  expect(result.exceptionError).toBeUndefined();
});
