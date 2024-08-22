import { expect, test } from "bun:test";
import { EVM } from "@ethereumjs/evm";
import { hexToBytes } from "viem";
import { bytesToBigint } from "viem/utils";
import { compile } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const getCode = async (source: string) => {
  const evm = await EVM.create();
  const code = compile(parse(tokenize(source)));
  const result = await evm.runCode({ code: hexToBytes(code) });

  return { code, result };
};

test("empty block", async () => {
  const { result, code } = await getCode(`
contract C {
  function run() external {
  }
}`);

  expect(result.exceptionError).toBeUndefined();
  expect(code).toBe("0x");
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

test("return", async () => {
  const { result } = await getCode(`
contract C {
  function run() external returns (uint256) {
    return 10;
  }
}`);

  expect(bytesToBigint(result.returnValue)).toBe(10n);

  expect(result.exceptionError).toBeUndefined();
});
