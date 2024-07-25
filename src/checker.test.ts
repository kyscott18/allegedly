import { expect, test } from "bun:test";
import { type CheckContext, checkStatement } from "./checker";
import type { TypeError } from "./errors/type";
import { tokenize } from "./lexer";
import { type ParseContext, parseBlockStatement } from "./parser";
import type { Ast } from "./types/ast";

const getError = <ast extends Ast.Statement | Ast.Definition | Ast.Expression>(
  source: string,
  parser: (context: ParseContext) => ast,
  checker: (ast: ast, context: CheckContext) => void,
): TypeError | undefined => {
  try {
    const tokens = tokenize(source);

    checker(parser({ tokens, tokenIndex: 0 }), { symbols: [] });

    return undefined;
  } catch (error) {
    return error as TypeError;
  }
};

test("2271", () => {
  const error = getError(
    `{
  uint256 a;
  string b;
  a + b;
}`,
    parseBlockStatement,
    checkStatement,
  );

  expect(error).toBeDefined();
  console.log(error);
  expect(error!.code).toBe(2271);
});
