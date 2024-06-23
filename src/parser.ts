import { NotImplementedError } from "./errors/notImplemented";
import { type Lexer, createLexer } from "./lexer";
import type { Ast } from "./types/ast";
import type { Token } from "./types/token";

export const parse = (source: string) => {
  const program: Ast.Program = [];

  const lexer = createLexer(source);

  while (true) {
    const token = lexer.readNextToken();
    if (token === undefined) break;

    const statement = parseStatement(token, lexer);

    if (statement === undefined) break;

    program.push(statement);
  }

  return program;
};

const parseStatement = (token: Token.Token, lexer: Lexer): Ast.Statement | undefined => {
  const expression = parseExpression(token, lexer);
  if (expression === undefined) return undefined;
  return {
    type: "expressionStatement",
    expression,
  } satisfies Ast.ExpressionStatement;
};

const parseExpression = (
  token: Token.Token | undefined,
  lexer: Lexer,
): Ast.Expression | undefined => {
  if (token === undefined) return undefined;

  if (token.type === "identifier") {
    const identifer = {
      type: "identifier",
      token,
    } satisfies Ast.Identifier;
    const maybeOperand = lexer.readNextToken();

    if (maybeOperand === undefined) {
      return identifer;
    }

    if (maybeOperand.type === "plus") {
      const right = parseExpression(lexer.readNextToken(), lexer);

      if (right === undefined) throw new Error("bad");

      return {
        type: "binaryOperation",
        operator: maybeOperand,
        left: identifer,
        right,
      } satisfies Ast.BinaryOperation;
    }

    throw new NotImplementedError({ source: "" });
  }

  throw new NotImplementedError({ source: "" });
};

const recurse;
