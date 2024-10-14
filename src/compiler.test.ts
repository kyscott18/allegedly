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
  const ast = parse(source, tokenize(source));
  const symbols = check(source, ast);
  const { code } = compile(source, ast, symbols);
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

const getStack = (result: ExecResult, i = 0) => {
  return toHex(result.runState?.stack.getStack()[i]!);
};

////////
// Function statements
////////

test("empty block", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external { }
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
  function run() external {
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
    // address
    0xa83114A443dA1CecEFC50368531cACE9F37fCCcb;
    // uint256;
    10;
    // bytes32
    0x01;
    // boolean;
    true;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result, 0)).toBe("0xa83114a443da1cecefc50368531cace9f37fcccb");
  expect(getStack(result, 1)).toBe("0xa");
  expect(getStack(result, 2)).toBe("0x1");
  expect(getStack(result, 3)).toBe("0x1");
});

test("negative", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    -10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe(
    "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6",
  );
});

test("increment", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
    x++;
    ++x;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result, 0)).toBe("0xa");
  expect(getStack(result, 1)).toBe("0xc");
});

test("decrement", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
    x--;
    --x;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result, 0)).toBe("0xa");
  expect(getStack(result, 1)).toBe("0x8");
});

test("delete", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
    delete x;
    x;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result, 0)).toBe("0x0");
});

test("not", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    !true;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x0");
});

test("bitwise not", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    ~10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe(
    "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff5",
  );
});

test("add", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 + 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0xc");
});

test("sub", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 - 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x8");
});

test("mul", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 * 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x14");
});

test("div", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 / 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x5");
});

test("mod", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 % 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x1");
});

test("pow", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    2 ** 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x8");
});

test("and", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    true && false;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x0");
});

test("or", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    true || false;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x1");
});

test("eq", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 == 19;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x0");
});

test("not eq", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 != 19;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x1");
});

test("less", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 < 19;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x1");
});

test("less eq", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    19 <= 19;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x1");
});

test("more", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 > 19;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x0");
});

test("more eq", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    8 >= 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x1");
});

test("bitwise and", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    6 & 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x2");
});

test("bitwise or", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    6 | 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x7");
});

test("bitwise xor", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 ^ 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x9");
});

test("shift left", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    6 << 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x18");
});

test("shift right", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    10 >> 1;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x5");
});

test("conditional", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    true ? 10 : 8;
    false ? 10 : 8;

  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0xa");
  expect(getStack(result, 1)).toBe("0x8");
});

test("variable assignment", async () => {
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

test("identifier", async () => {
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
  expect(getStack(result)).toBe("0xa");
});

test("assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x;
    x = 10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0xa");
});

test("add assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 5;
    x += 10;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0xf");
});

test("sub assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 5;
    x -= 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x3");
});

test("mul assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 5;
    x *= 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0xa");
});

test("div assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 15;
    x /= 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x5");
});

test("bitwise and assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 6;
    x &= 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x2");
});

test("bitwise or assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 6;
    x |= 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x7");
});

test("bitwise xor assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
    x ^= 3;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x9");
});

test("shift left assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 6;
    x <<= 2;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x18");
});

test("shift right assign", async () => {
  const { result } = await getCode(
    `
contract C {
  function run() external {
    uint256 x = 10;
    x >>= 1;
  }
}`,
    toFunctionSelector("function run()"),
  );

  expect(result.exceptionError).toBeUndefined();
  expect(getStack(result)).toBe("0x5");
});
