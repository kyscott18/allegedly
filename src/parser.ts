import { Ast } from "./types/ast";
import { Token } from "./types/token";

export type ParseContext = {
  tokens: Token.Token[];
  tokenIndex: number;
  // TODO(kyle) depth: number;
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

export const tryParseDefinition = (context: ParseContext): Ast.Definition | undefined => {
  const token = context.tokens[context.tokenIndex];
  if (token === undefined) return undefined;

  return (
    tryParseFunctionDefinition(context) ??
    tryParseContractDefinition(context) ??
    tryParseEventDefinition(context) ??
    tryParseErrorDefinition(context) ??
    tryParseStructDefinition(context) ??
    tryParseModifierDefinition(context) ??
    undefined
  );
};

export const tryParseFunctionDefinition = (
  _context: ParseContext,
): Ast.FunctionDefinition | undefined => {};

export const tryParseContractDefinition = (
  context: ParseContext,
): Ast.ContractDefinition | undefined => {};

export const tryParseEventDefinition = (
  context: ParseContext,
): Ast.EventDefinition | undefined => {};

export const tryParseErrorDefinition = (
  context: ParseContext,
): Ast.ErrorDefinition | undefined => {};

export const tryParseStructDefinition = (
  context: ParseContext,
): Ast.StructDefinition | undefined => {};

export const tryParseModifierDefinition = (
  context: ParseContext,
): Ast.ModifierDefinition | undefined => {};

// statements

export const tryParseStatement = (context: ParseContext): Ast.Statement | undefined => {
  const token = context.tokens[context.tokenIndex];
  if (token === undefined) return undefined;

  return (
    tryParseExpressionStatement(context) ??
    tryParseBlockStatement(context) ??
    tryParseUncheckedBlockStatement(context) ??
    tryParseIfStatement(context) ??
    tryParseForStatement(context) ??
    tryParseWhileStatement(context) ??
    tryParseDoWhileStatement(context) ??
    tryParseBreakStatement(context) ??
    tryParseContinueStatement(context) ??
    tryParseEmitStatement(context) ??
    tryParseRevertStatement(context) ??
    tryParseReturnStatement(context) ??
    tryParsePlaceholderStatement(context) ??
    undefined
  );
};

export const tryParseExpressionStatement = (
  context: ParseContext,
): Ast.ExpressionStatement | undefined => {
  const startIndex = context.tokenIndex;

  let expression: Ast.Expression | undefined = undefined;
  for (const expressionParser of expressionParsers) {
    context.tokenIndex = startIndex;

    const maybeExpression = expressionParser(context);
    if (maybeExpression === undefined) continue;

    const maybeSemiColon = context.tokens[context.tokenIndex];

    if (maybeSemiColon?.token === Token.TokenType.Semicolon) {
      context.tokenIndex++;
      expression = maybeExpression;
      break;
    }
  }

  if (expression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.ExpressionStatement,
    expression,
  };
};

export const tryParseBlockStatement = (context: ParseContext): Ast.BlockStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeOpenCurlyBracket = context.tokens[context.tokenIndex++];

  if (maybeOpenCurlyBracket === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeOpenCurlyBracket.token !== Token.TokenType.OpenCurlyBrace) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const statements: Ast.Statement[] = [];

  while (true) {
    const maybeCloseCurlyBracket = context.tokens[context.tokenIndex];

    if (maybeCloseCurlyBracket?.token === Token.TokenType.CloseCurlyBrace) {
      context.tokenIndex++;

      return {
        ast: Ast.AstType.BlockStatement,
        statements,
      };
    }

    const statement = tryParseStatement(context);
    if (statement === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    statements.push(statement);
  }
};

export const tryParseUncheckedBlockStatement = (
  context: ParseContext,
): Ast.UncheckedBlockStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeUnchecked = context.tokens[context.tokenIndex++];

  if (maybeUnchecked?.token !== Token.TokenType.Unchecked) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeOpenCurlyBracket = context.tokens[context.tokenIndex++];

  if (maybeOpenCurlyBracket?.token !== Token.TokenType.OpenCurlyBrace) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const statements: Ast.Statement[] = [];

  while (true) {
    const maybeCloseCurlyBracket = context.tokens[context.tokenIndex];

    if (maybeCloseCurlyBracket?.token === Token.TokenType.CloseCurlyBrace) {
      context.tokenIndex++;

      return {
        ast: Ast.AstType.UncheckedBlockStatement,
        statements,
      };
    }

    const statement = tryParseStatement(context);
    if (statement === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    statements.push(statement);
  }
};

export const tryParseIfStatement = (context: ParseContext): Ast.IfStatement | undefined => {};

export const tryParseForStatement = (context: ParseContext): Ast.ForStatement | undefined => {};

export const tryParseWhileStatement = (context: ParseContext): Ast.WhileStatement | undefined => {};

export const tryParseDoWhileStatement = (
  context: ParseContext,
): Ast.DoWhileStatement | undefined => {};

export const tryParseBreakStatement = (context: ParseContext): Ast.BreakStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeBreak = context.tokens[context.tokenIndex++];

  if (maybeBreak?.token !== Token.TokenType.Break) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeSemiColon = context.tokens[context.tokenIndex++];

  if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.BreakStatement,
  };
};

export const tryParseContinueStatement = (
  context: ParseContext,
): Ast.ContinueStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeContinue = context.tokens[context.tokenIndex++];

  if (maybeContinue?.token !== Token.TokenType.Continue) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeSemiColon = context.tokens[context.tokenIndex++];

  if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.ContinueStatement,
  };
};

export const tryParseEmitStatement = (context: ParseContext): Ast.EmitStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeEmit = context.tokens[context.tokenIndex++];

  if (maybeEmit?.token !== Token.TokenType.Emit) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const event = tryParseFunctionCallExpression(context);
  if (event === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeSemiColon = context.tokens[context.tokenIndex++];

  if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.EmitStatement,
    event,
  };
};

export const tryParseRevertStatement = (context: ParseContext): Ast.RevertStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeRevert = context.tokens[context.tokenIndex++];

  if (maybeRevert?.token !== Token.TokenType.Revert) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const error = tryParseFunctionCallExpression(context);
  if (error === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeSemiColon = context.tokens[context.tokenIndex++];

  if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.RevertStatement,
    error,
  };
};

export const tryParseReturnStatement = (context: ParseContext): Ast.ReturnStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeReturn = context.tokens[context.tokenIndex++];

  if (maybeReturn?.token !== Token.TokenType.Return) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const expression = tryParseExpression(context);
  if (expression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeSemiColon = context.tokens[context.tokenIndex++];

  if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.ReturnStatement,
    expression,
  };
};

export const tryParsePlaceholderStatement = (
  context: ParseContext,
): Ast.PlaceholderStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybePlaceholder = context.tokens[context.tokenIndex++];

  if (maybePlaceholder?.token !== Token.TokenType.Placeholder) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeSemiColon = context.tokens[context.tokenIndex++];

  if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.PlaceholderStatement,
  };
};

// expressions

export const tryParseExpression = (context: ParseContext): Ast.Expression | undefined => {
  const token = context.tokens[context.tokenIndex];
  if (token === undefined) return undefined;

  // lookahead to make a more informed decision
  switch (token.token) {
    case Token.TokenType.Identifier:
      return (
        tryParseIdentifier(context) ??
        tryParseBinaryOperation(context) ??
        tryParseConditionalExpression(context) ??
        undefined
      );

    case Token.TokenType.Address:
    case Token.TokenType.String:
    case Token.TokenType.Uint:
    case Token.TokenType.Int:
    case Token.TokenType.Byte:
    case Token.TokenType.Bytes:
    case Token.TokenType.Bool:
      return tryParseVariableDeclaration(context);

    default:
      for (const expressionParser of expressionParsers) {
        const expression = expressionParser(context);
        if (expression !== undefined) return expression;
      }
      return undefined;
  }
};

export const tryParseIdentifier = (context: ParseContext): Ast.Identifier | undefined => {
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

export const tryParseLiteral = (context: ParseContext): Ast.Literal | undefined => {
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

export const tryParseAssignment = (context: ParseContext): Ast.Assignment | undefined => {
  const startIndex = context.tokenIndex;

  const left = tryParseIdentifier(context);
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

export const tryParseUnaryOperation = (context: ParseContext): Ast.UnaryOperation | undefined => {
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

export const tryParseBinaryOperation = (context: ParseContext): Ast.BinaryOperation | undefined => {
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
  context: ParseContext,
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

export const tryParseFunctionCallExpression = (
  context: ParseContext,
): Ast.FunctionCallExpression | undefined => {
  const startIndex = context.tokenIndex;

  const expression = tryParseExpression(context);
  if (expression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const _arguments = tryParseTupleExpression(context);
  if (_arguments === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.FunctionCallExpression,
    expression,
    arguments: _arguments.elements,
  };
};

export const tryParseMemberAccessExpression = (
  context: ParseContext,
): Ast.MemberAccessExpression | undefined => {
  const startIndex = context.tokenIndex;

  const expression = tryParseExpression(context);
  if (expression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeMember = context.tokens[context.tokenIndex++];

  if (maybeMember === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeMember.token !== Token.TokenType.Member) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const memberIdentifier = tryParseIdentifier(context);
  if (memberIdentifier === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.MemberAccessExpression,
    expression,
    member: memberIdentifier,
  };
};

export const tryParseIndexAccessExpression = (
  context: ParseContext,
): Ast.IndexAccessExpression | undefined => {
  const startIndex = context.tokenIndex;

  const base = tryParseExpression(context);
  if (base === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeOpenBracket = context.tokens[context.tokenIndex++];

  if (maybeOpenBracket === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeOpenBracket.token !== Token.TokenType.OpenBracket) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const index = tryParseExpression(context);
  if (index === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeCloseBracket = context.tokens[context.tokenIndex++];

  if (maybeCloseBracket === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeCloseBracket.token !== Token.TokenType.CloseBracket) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.IndexAccessExpression,
    base,
    index,
  };
};

export const tryParseNewExpression = (context: ParseContext): Ast.NewExpression | undefined => {
  const startIndex = context.tokenIndex;

  const maybeNew = context.tokens[context.tokenIndex++];

  if (maybeNew === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (maybeNew.token !== Token.TokenType.New) {
    context.tokenIndex = startIndex;
    return undefined;
  }
  const expression = tryParseExpression(context);
  if (expression === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  return {
    ast: Ast.AstType.NewExpression,
    expression,
  };
};

export const tryParseTupleExpression = (context: ParseContext): Ast.TupleExpression | undefined => {
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

  const elements: Ast.Expression[] = [];

  while (true) {
    const maybeCloseParenthesis = context.tokens[context.tokenIndex];

    if (maybeCloseParenthesis?.token === Token.TokenType.CloseParenthesis) {
      context.tokenIndex++;

      return {
        ast: Ast.AstType.TupleExpression,
        elements,
      };
    }

    if (elements.length > 0) {
      const maybeComma = context.tokens[context.tokenIndex++];
      if (maybeComma?.token !== Token.TokenType.Comma) {
        context.tokenIndex = startIndex;
        return undefined;
      }
    }

    const expression = tryParseExpression(context);
    if (expression === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    elements.push(expression);
  }
};

export const tryParseVariableDeclaration = (
  context: ParseContext,
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

  const maybeAssign = context.tokens[context.tokenIndex++];

  if (maybeAssign === undefined || maybeAssign.token !== Token.TokenType.Assign) {
    context.tokenIndex--;
    return {
      ast: Ast.AstType.VariableDeclaration,
      type,
      location: maybeLocation,
      attributes: [],
      identifier: identifier.token,
      initializer: undefined,
    };
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

const expressionParsers = [
  tryParseIdentifier,
  tryParseLiteral,
  tryParseAssignment,
  tryParseUnaryOperation,
  tryParseBinaryOperation,
  tryParseConditionalExpression,
  tryParseFunctionCallExpression,
  tryParseMemberAccessExpression,
  tryParseIndexAccessExpression,
  tryParseNewExpression,
  tryParseTupleExpression,
  tryParseVariableDeclaration,
];

// types

export const tryParseType = (context: ParseContext): Ast.Type | undefined => {
  return (
    tryParseElementaryType(context) ??
    tryParseArrayType(context) ??
    tryParseMapping(context) ??
    undefined
  );
};

export const tryParseElementaryType = (context: ParseContext): Ast.ElementaryType | undefined => {
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

export const tryParseArrayType = (context: ParseContext): Ast.ArrayType | undefined => {};

export const tryParseMapping = (context: ParseContext): Ast.Mapping | undefined => {};
