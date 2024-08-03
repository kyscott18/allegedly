import { expect, test } from "bun:test";
import { type CheckContext, checkExpression, checkStatement } from "./checker";
import type { TypeError } from "./errors/type";
import { tokenize } from "./lexer";
import { type ParseContext, parseBlockStatement, parseExpression } from "./parser";
import type { Ast } from "./types/ast";

const getError = <ast extends Ast.Statement | Ast.Definition | Ast.Expression>(
  source: string,
  parser: (context: ParseContext) => ast,
  checker: (context: CheckContext, ast: ast) => void,
): TypeError | undefined => {
  try {
    const tokens = tokenize(source);

    checker({ symbols: [] }, parser({ tokens, tokenIndex: 0 }));

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
  const error = getError(
    `
{
  bool a = false;
}`,
    parseBlockStatement,
    checkStatement,
  );
  if (error) throw error;
});
