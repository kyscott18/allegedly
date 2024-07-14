import { expect, test } from "bun:test";
import { type CheckContext, checkStatement } from "./checker";
import type { BaseError } from "./errors/base";
import { tokenize } from "./lexer";
import { type ParseContext, tryParseBlockStatement } from "./parser";
import type { Ast } from "./types/ast";

const getError = <ast extends Ast.Statement | Ast.Definition | Ast.Expression>(
  source: string,
  parser: (context: ParseContext) => ast | undefined,
  checker: (ast: ast, context: CheckContext) => void,
): BaseError | undefined => {
  try {
    const tokens = tokenize(source);

    checker(parser({ tokens, tokenIndex: 0 })!, { symbols: [] });

    return undefined;
  } catch (error) {
    return error as BaseError;
  }
};

test("2271", () => {
  const error = getError(
    `{
  uint256 a;
  string b;
  a + b;
}`,
    tryParseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  console.log(error);
  expect(error!.code).toBe(2271);
});
