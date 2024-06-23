import type { Ast } from "./types/ast";
import type { Token } from "./types/token";

type Context = {
  tokens: Token.Token[];
  tokenIndex: number;
};

export const parse = (tokens: Token.Token[]): Ast.Program => {
  const program: Ast.Program = [];
  const context = { tokens, tokenIndex: 0 };

  while (context.tokenIndex < tokens.length) {
    const statement = tryParseStatement(context);

    if (statement === undefined) break;

    program.push(statement);
  }

  return program;
};

const tryParseStatement = (context: Context): Ast.Statement | undefined => {
  const expression = tryParseExpression(context);
  if (expression === undefined) return undefined;
  return {
    type: "expressionStatement",
    expression,
  } satisfies Ast.ExpressionStatement;
};

const tryParseExpression = (context: Context): Ast.Expression | undefined => {
  const token = context.tokens[context.tokenIndex];
  if (token === undefined) return undefined;

  return (
    tryParseVariableDeclaration(context) ??
    tryParseAssignment(context) ??
    tryParseBinaryOperation(context) ??
    tryParseVariableDeclaration(context) ??
    undefined
  );
};

const tryParseIdentifier = (context: Context): Ast.Identifier | undefined => {
  return undefined;
};

const tryParseAssignment = (context: Context): Ast.Assignment | undefined => {
  return undefined;
};

const tryParseBinaryOperation = (context: Context): Ast.BinaryOperation | undefined => {
  const startIndex = context.tokenIndex;

  const left = tryParseExpression(context);
  if (left === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeOperator = context.tokens[context.tokenIndex++];

  if (maybeOperator === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (
    maybeOperator.type !== "add" &&
    maybeOperator.type !== "subtract" &&
    maybeOperator.type !== "mul" &&
    maybeOperator.type !== "divide" &&
    maybeOperator.type !== "modulo" &&
    maybeOperator.type !== "power" &&
    maybeOperator.type !== "and" &&
    maybeOperator.type !== "or" &&
    maybeOperator.type !== "equal" &&
    maybeOperator.type !== "notEqual" &&
    maybeOperator.type !== "less" &&
    maybeOperator.type !== "lessEqual" &&
    maybeOperator.type !== "more" &&
    maybeOperator.type !== "moreEqual"
  ) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const right = tryParseExpression(context);
  if (right === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    type: "binaryOperation",
    operator: maybeOperator,
    left,
    right,
  };
};

const tryParseVariableDeclaration = (context: Context): Ast.VariableDeclaration | undefined => {
  const startIndex = context.tokenIndex;

  // TODO(kyle) don't assert defined
  const type = context.tokens[context.tokenIndex]!;

  if (
    type.type !== "address" &&
    type.type !== "string" &&
    type.type !== "uint" &&
    type.type !== "int" &&
    type.type !== "bytes" &&
    type.type !== "bool"
  ) {
    return undefined;
  }

  context.tokenIndex++;
  const identifier = tryParseIdentifier(context);

  if (identifier === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeAssignOrSemicolon = context.tokens[context.tokenIndex++];

  if (maybeAssignOrSemicolon === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeAssignOrSemicolon.type === "semicolon") {
    return {
      type: "variableDeclaration",
      ty: type,
      location: undefined,
      attributes: [],
      identifier: identifier.token,
      initializer: undefined,
    };
  }

  if (maybeAssignOrSemicolon.type !== "assign") {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const initializer = tryParseExpression(context);

  if (initializer === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    type: "variableDeclaration",
    ty: type,
    location: undefined,
    attributes: [],
    identifier: identifier.token,
    initializer,
  };
};
