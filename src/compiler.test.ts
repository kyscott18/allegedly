import { expect, test } from "bun:test";
import { EVM, type ExecResult } from "@ethereumjs/evm";
import { type Hex, concat, hexToBytes, padHex, toFunctionSelector, toHex } from "viem";
import { bytesToBigint } from "viem/utils";
import { check } from "./checker";
import { compile } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";

const getCode = async (source: string, input?: Hex) => {
  const evm = await EVM.create();
  const ast = parse(tokenize(source));
  const symbols = check(ast);
  const code = compile(ast, symbols);
  const result = await evm.runCode({
    code: hexToBytes(code),
    data: input ? hexToBytes(input) : undefined,
  });

  return { code, result };
};

// @ts-expect-error
const printStack = (result: ExecResult) => {
  console.log(result.runState?.stack.getStack().map((x) => toHex(x)));
};

////////
// Function statements
////////

test("empty block", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
});

test("return", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external returns (uint256) {
    return 10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(bytesToBigint(result.returnValue)).toBe(10n);

  expect(result.exceptionError).toBeUndefined();
});

test("function parameters", async () => {
  const { result } = await getCode(
    `
contract C {
  function run(uint256 a) external returns (uint256) {
    return a;
  }
}`,
    concat([toFunctionSelector("function run(uint256 a)"), padHex("0xa", { size: 32 })]),
  );

  expect(bytesToBigint(result.returnValue)).toBe(10n);

  expect(result.exceptionError).toBeUndefined();
});

test("function selectors", async () => {
  const { result } = await getCode(
    `
contract C {
  function run1() external returns (uint256) {
    return 1;
  }
  function run2() external returns (uint256) {
    return 2;
  }
}`,
    toFunctionSelector("function run2()"),
  );

  expect(result.exceptionError).toBeUndefined();

  expect(bytesToBigint(result.returnValue)).toBe(2n);
});

test("function selectors without match", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external returns (uint256) {
  }
}`,
    toFunctionSelector("function bun()"),
  );

  expect(result.exceptionError).toBeDefined();
});

////////
// Expressions
////////

test("literal", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
});

test("literal assignment", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
});

test.only("identifier", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
    x;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
});

test("function call expression", async () => {
  const { result } = await getCode(
    `
contract Identity {
  function identity(uint256 a) external view returns (uint256) {
    return 10;
  }
}

contract C {
  function run() external {
    return Identity(0x0000000000000000000000000000000000000004).identity(10);
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();

  expect(bytesToBigint(result.returnValue)).toBe(10n);
});
