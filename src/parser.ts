import { Ast } from "./types/ast";
import { Token } from "./types/token";

type Context = {
  tokens: Token.Token[];
  tokenIndex: number;
};

export const parse = (tokens: Token.Token[]): Ast.Program => {
  const program: Ast.Program = [];
  const context = { tokens, tokenIndex: 0 };

  while (context.tokenIndex < tokens.length) {
    const defintion = tryParseDefinition(context);

    if (defintion === undefined) break;

    program.push(defintion);
  }

  return program;
};

// defintions

export const tryParseDefinition = (context: Context): Ast.Definition | undefined => {
  const token = context.tokens[context.tokenIndex];
  if (token === undefined) return undefined;

  return tryParseFunctionDefinition(context) ?? undefined;
};

export const tryParseFunctionDefinition = (
  _context: Context,
): Ast.FunctionDefinition | undefined => {};

// statements

export const tryParseStatement = (context: Context): Ast.Statement | undefined => {
  const expression = tryParseExpression(context);
  if (expression === undefined) return undefined;
  return {
    ast: Ast.AstType.ExpressionStatement,
    expression,
  } satisfies Ast.ExpressionStatement;
};

// expressions

export const tryParseExpression = (context: Context): Ast.Expression | undefined => {
  const token = context.tokens[context.tokenIndex];
  if (token === undefined) return undefined;

  return (
    tryParseIdentifier(context) ??
    tryParseVariableDeclaration(context) ??
    tryParseAssignment(context) ??
    tryParseBinaryOperation(context) ??
    tryParseVariableDeclaration(context) ??
    undefined
  );
};

export const tryParseIdentifier = (context: Context): Ast.Identifier | undefined => {
  const maybeIdentifier = context.tokens[context.tokenIndex++];

  if (maybeIdentifier === undefined) {
    context.tokenIndex--;
    return undefined;
  }

  if (maybeIdentifier.token !== Token.TokenType.Identifier) {
    context.tokenIndex--;
    return undefined;
  }

  return { ast: Ast.AstType.Identifier, token: maybeIdentifier };
};

export const tryParseLiteral = (context: Context): Ast.Literal | undefined => {
  const maybeLiteral = context.tokens[context.tokenIndex++];

  if (maybeLiteral === undefined) {
    context.tokenIndex--;
    return undefined;
  }

  if (
    maybeLiteral.token !== Token.TokenType.StringLiteral &&
    maybeLiteral.token !== Token.TokenType.AddressLiteral &&
    maybeLiteral.token !== Token.TokenType.HexLiteral &&
    maybeLiteral.token !== Token.TokenType.NumberLiteral &&
    maybeLiteral.token !== Token.TokenType.RationalNumberLiteral &&
    maybeLiteral.token !== Token.TokenType.HexNumberLiteral &&
    maybeLiteral.token !== Token.TokenType.BoolLiteral
  ) {
    context.tokenIndex--;
    return undefined;
  }

  return { ast: Ast.AstType.Literal, token: maybeLiteral };
};

export const tryParseAssignment = (context: Context): Ast.Assignment | undefined => {
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
    maybeOperator.token !== Token.TokenType.Assign &&
    maybeOperator.token !== Token.TokenType.AddAssign &&
    maybeOperator.token !== Token.TokenType.SubtractAssign &&
    maybeOperator.token !== Token.TokenType.MulAssign &&
    maybeOperator.token !== Token.TokenType.DivideAssign &&
    maybeOperator.token !== Token.TokenType.ModuloAssign &&
    maybeOperator.token !== Token.TokenType.BitwiseAndAssign &&
    maybeOperator.token !== Token.TokenType.BitwiseOrAssign &&
    maybeOperator.token !== Token.TokenType.BitwiseXOrAssign &&
    maybeOperator.token !== Token.TokenType.ShiftRightAssign &&
    maybeOperator.token !== Token.TokenType.ShiftLeftAssign
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
    ast: Ast.AstType.Assignment,
    operator: maybeOperator,
    left,
    right,
  };
};

export const tryParseUnaryOperation = (context: Context): Ast.UnaryOperation | undefined => {
  const startIndex = context.tokenIndex;

  const maybeOperator = context.tokens[context.tokenIndex++];

  if (maybeOperator === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (
    maybeOperator.token !== Token.TokenType.Increment &&
    maybeOperator.token !== Token.TokenType.Decrement &&
    maybeOperator.token !== Token.TokenType.Subtract &&
    maybeOperator.token !== Token.TokenType.Delete
  ) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const expression = tryParseExpression(context);
  if (expression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.UnaryOperation,
    operator: maybeOperator,
    expression,
  };
};

export const tryParseBinaryOperation = (context: Context): Ast.BinaryOperation | undefined => {
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
    maybeOperator.token !== Token.TokenType.Add &&
    maybeOperator.token !== Token.TokenType.Subtract &&
    maybeOperator.token !== Token.TokenType.Mul &&
    maybeOperator.token !== Token.TokenType.Divide &&
    maybeOperator.token !== Token.TokenType.Modulo &&
    maybeOperator.token !== Token.TokenType.Power &&
    maybeOperator.token !== Token.TokenType.And &&
    maybeOperator.token !== Token.TokenType.Or &&
    maybeOperator.token !== Token.TokenType.Equal &&
    maybeOperator.token !== Token.TokenType.NotEqual &&
    maybeOperator.token !== Token.TokenType.Less &&
    maybeOperator.token !== Token.TokenType.LessEqual &&
    maybeOperator.token !== Token.TokenType.More &&
    maybeOperator.token !== Token.TokenType.MoreEqual &&
    maybeOperator.token !== Token.TokenType.BitwiseAnd &&
    maybeOperator.token !== Token.TokenType.BitwiseOr &&
    maybeOperator.token !== Token.TokenType.BitwiseXOr &&
    maybeOperator.token !== Token.TokenType.ShiftRight &&
    maybeOperator.token !== Token.TokenType.ShiftLeft
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
    ast: Ast.AstType.BinaryOperation,
    operator: maybeOperator,
    left,
    right,
  };
};

export const tryParseConditionalExpression = (
  context: Context,
): Ast.ConditionalExpression | undefined => {
  const startIndex = context.tokenIndex;

  const condition = tryParseExpression(context);
  if (condition === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeQuestion = context.tokens[context.tokenIndex++];

  if (maybeQuestion === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeQuestion.token !== Token.TokenType.Question) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const trueExpression = tryParseExpression(context);
  if (trueExpression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeColon = context.tokens[context.tokenIndex++];

  if (maybeColon === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeColon.token !== Token.TokenType.Colon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const falseExpression = tryParseExpression(context);
  if (falseExpression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.ConditionalExpression,
    condition,
    trueExpression,
    falseExpression,
  };
};

// function call expression

// member access expression

// index access expression

// new expression

export const tryParseTupleExpression = (context: Context) => {
  const startIndex = context.tokenIndex;

  const maybeOpenParenthesis = context.tokens[context.tokenIndex++];

  if (maybeOpenParenthesis === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeOpenParenthesis.token !== Token.TokenType.OpenParenthesis) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const expressions: Ast.Expression[] = [];

  while (true) {
    const maybeCloseParenthesis = context.tokens[context.tokenIndex];
    console.log(0);
    if (maybeCloseParenthesis?.token === Token.TokenType.CloseParenthesis) {
      context.tokenIndex++;

      return {
        ast: Ast.AstType.TupleExpression,
        expressions,
      };
    }

    const expression = tryParseExpression(context);
    if (expression === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    expressions.push(expression);
  }
};

export const tryParseVariableDeclaration = (
  context: Context,
): Ast.VariableDeclaration | undefined => {
  const startIndex = context.tokenIndex;

  const type = tryParseType(context);
  if (type === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  let maybeLocation = context.tokens[context.tokenIndex++];

  if (maybeLocation === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (
    maybeLocation.token !== Token.TokenType.Storage &&
    maybeLocation.token !== Token.TokenType.Memory &&
    maybeLocation.token !== Token.TokenType.Calldata
  ) {
    context.tokenIndex--;
    maybeLocation = undefined;
  }

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

  if (maybeAssignOrSemicolon.token === Token.TokenType.Semicolon) {
    return {
      ast: Ast.AstType.VariableDeclaration,
      type,
      location: maybeLocation,
      attributes: [],
      identifier: identifier.token,
      initializer: undefined,
    };
  }

  if (maybeAssignOrSemicolon.token !== Token.TokenType.Assign) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const initializer = tryParseExpression(context);

  if (initializer === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.VariableDeclaration,
    type,
    location: maybeLocation,
    attributes: [],
    identifier: identifier.token,
    initializer,
  };
};

// types

export const tryParseType = (context: Context): Ast.Type | undefined => {
  return tryParseElementaryType(context) ?? undefined;
};

export const tryParseElementaryType = (context: Context): Ast.ElementaryType | undefined => {
  const maybeType = context.tokens[context.tokenIndex++];

  if (maybeType === undefined) {
    context.tokenIndex--;
    return undefined;
  }

  if (
    maybeType.token !== Token.TokenType.Address &&
    maybeType.token !== Token.TokenType.String &&
    maybeType.token !== Token.TokenType.Uint &&
    maybeType.token !== Token.TokenType.Int &&
    maybeType.token !== Token.TokenType.Byte &&
    maybeType.token !== Token.TokenType.Bytes &&
    maybeType.token !== Token.TokenType.Bool
  ) {
    context.tokenIndex--;
    return undefined;
  }

  return { ast: Ast.AstType.ElementaryType, type: maybeType };
};
