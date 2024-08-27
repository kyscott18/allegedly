import { expect, test } from "bun:test";
import {
  type CheckContext,
  check,
  checkDefinition,
  checkExpression,
  checkStatement,
} from "./checker";
import type { TypeError } from "./errors/type";
import { tokenize } from "./lexer";
import {
  type ParseContext,
  parse,
  parseBlockStatement,
  parseContractDefinition,
  parseExpression,
} from "./parser";
import type { Ast } from "./types/ast";

const getError = <ast extends Ast.Statement | Ast.Definition | Ast.Expression>(
  source: string,
  parser: (context: ParseContext) => ast,
  checker: (context: CheckContext, ast: ast) => void,
): TypeError | undefined => {
  try {
    const tokens = tokenize(source);

    checker({ symbols: [], isContractScope: false }, parser({ tokens, tokenIndex: 0 }));

    return undefined;
  } catch (error) {
    return error as TypeError;
  }
};

test("2271", () => {
  let error = getError("10 + true", parseExpression, checkExpression);

  expect(error).toBeDefined();
  expect(error!.code).toBe(2271);

  error = getError(
    `
{
  uint256 a;
  string b;
  a + b;
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(2271);
});

test("no 2271", () => {
  const error = getError("10 + 20", parseExpression, checkExpression);
  if (error) throw error;
});

test("2333", () => {
  const error = getError(
    `
{
  uint256 a;
  uint256 a;
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(2333);
});

test("4907", () => {
  const error = getError(
    `
  {
    uint256 a;
    -a;
  }`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(4907);
});

test("5704", () => {
  const error = getError(
    `
  {
    10(10);
  }`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(5704);
});

test("6160", () => {
  let error = getError(
    `
  {
    uint256();
  }`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(6160);

  error = getError(
    `
  {
    uint256(10, 10);
  }`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(6160);
});

test("7407", () => {
  let error = getError(
    `
  {
    uint256 a;
    a = true;
  }`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(7407);

  error = getError(
    `
{
  bool a;
  {
    uint256 a;
    a = true;
  }
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(7407);
});

test("no 7407", () => {
  const error = getError(
    `
  {
    uint256 a;
    a = 10;
  }`,
    parseBlockStatement,
    checkStatement,
  );
  if (error) throw error;
});

test("7576", () => {
  let error = getError(
    `
{
  a;
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(7576);

  error = getError(
    `
{
  {
    uint256 x;
  }
  x;
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(7576);
});

test.todo("9553");

test("9574", () => {
  const error = getError(
    `
{
  uint256 a = true;
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9574);
});

test("no 9574", () => {
  let error = getError(
    `
{
  bool a = false;
}`,
    parseBlockStatement,
    checkStatement,
  );
  if (error) throw error;

  error = getError(
    `
{
  int128 a = 10;
}`,
    parseBlockStatement,
    checkStatement,
  );
  if (error) throw error;
});

test("9640", () => {
  // integer to integer
  let error = getError(
    `
{
  uint128(int256(10));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);

  // integer to address
  error = getError(
    `
{
  address(10);
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);

  // address to integer
  error = getError(
    `
{
  uint256(0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5);
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);

  // integer to fixed bytes
  error = getError(
    `
{
  bytes31(10);
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);

  // fixed bytes to integer
  error = getError(
    `
{
  uint248(bytes32(10));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);

  // fixed bytes to address
  error = getError(
    `
{
  address(bytes32(10));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);

  // address to fixed bytes
  error = getError(
    `
{
  bytes32(0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5);
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  expect(error!.code).toBe(9640);
});

test("no 9640", () => {
  // integer to integer
  let error = getError(
    `
{
uint128(uint256(int256(10)));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();

  // integer to address
  error = getError(
    `
{
address(uint160(10));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();

  // address to integer
  error = getError(
    `
{
  uint160(0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5);
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();

  // integer to fixed bytes
  error = getError(
    `
{
  bytes32(uint256(10));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();

  // fixed bytes to integer
  error = getError(
    `
{
  uint256(bytes32(uint256(10)));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();

  // fixed bytes to address
  error = getError(
    `
{
  address(bytes20(bytes32(uint256(10))));
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();

  // address to fixed bytes
  error = getError(
    `
{
  bytes20(0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5);
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeUndefined();
});
