import { UnrecognizedSymbolError } from "./errors/unrecognizedSymbol";
import { Ast } from "./types/ast";
import { Token } from "./types/token";

export type ParseContext = {
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
  // @ts-expect-error
): Ast.FunctionDefinition | undefined => {};

export const tryParseContractDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.ContractDefinition | undefined => {};

export const tryParseEventDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.EventDefinition | undefined => {};

export const tryParseErrorDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.ErrorDefinition | undefined => {};

export const tryParseStructDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.StructDefinition | undefined => {};

export const tryParseModifierDefinition = (
  _context: ParseContext,
  // @ts-expect-error
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

// @ts-expect-error
export const tryParseIfStatement = (_context: ParseContext): Ast.IfStatement | undefined => {};

// @ts-expect-error
export const tryParseForStatement = (_context: ParseContext): Ast.ForStatement | undefined => {};

export const tryParseWhileStatement = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.WhileStatement | undefined => {};

export const tryParseDoWhileStatement = (
  _context: ParseContext,
  // @ts-expect-error
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

  const events = tryParseFunctionCallExpression(context);
  for (const event of events) {
    const maybeSemiColon = context.tokens[context.tokenIndex++];

    if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    return {
      ast: Ast.AstType.EmitStatement,
      event,
    };
  }

  return undefined;
};

export const tryParseRevertStatement = (context: ParseContext): Ast.RevertStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeRevert = context.tokens[context.tokenIndex++];

  if (maybeRevert?.token !== Token.TokenType.Revert) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const errors = tryParseFunctionCallExpression(context);
  for (const error of errors) {
    const maybeSemiColon = context.tokens[context.tokenIndex++];

    if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    return {
      ast: Ast.AstType.RevertStatement,
      error,
    };
  }

  return undefined;
};

export const tryParseReturnStatement = (context: ParseContext): Ast.ReturnStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeReturn = context.tokens[context.tokenIndex++];

  if (maybeReturn?.token !== Token.TokenType.Return) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const expressions = tryParseExpression(context);
  for (const expression of expressions) {
    const maybeSemiColon = context.tokens[context.tokenIndex++];

    if (maybeSemiColon?.token !== Token.TokenType.Semicolon) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    return {
      ast: Ast.AstType.ReturnStatement,
      expression,
    };
  }

  return undefined;
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

// https://docs.soliditylang.org/en/v0.8.26/cheatsheet.html#order-of-precedence-of-operators
const getInfixBindingPower = (operator: Token.Token): [number, number] => {
  switch (operator.token) {
    case Token.TokenType.Add:
    case Token.TokenType.Subtract:
      return [1, 2];

    case Token.TokenType.Mul:
    case Token.TokenType.Divide:
    case Token.TokenType.Modulo:
      return [3, 4];

    case Token.TokenType.Member:
      return [5, 6];

    default:
      throw new UnrecognizedSymbolError({ symbol: operator.toString() });
  }
};

export function tryParseExpression(context: ParseContext, minBp = 0): Ast.Expression | undefined {
  const startIndex = context.tokenIndex;

  // TODO(kyle) check for unexpected tokens
  let left: Ast.Expression | undefined = tryParseIdentifier(context) ?? tryParseLiteral(context);
  if (left === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  while (true) {
    const operator = context.tokens[context.tokenIndex];

    if (operator === undefined || operator.token === Token.TokenType.Semicolon) {
      break;
    }

    // Note: assume operation is good

    const [lBp, rBp] = getInfixBindingPower(operator as any);

    if (lBp < minBp) break;

    context.tokenIndex++;

    const right = tryParseExpression(context, rBp);
    if (right === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    switch (operator.token) {
      case Token.TokenType.Member:
        left = {
          ast: Ast.AstType.MemberAccessExpression,
          expression: left!,
          member: right as any,
        } satisfies Ast.MemberAccessExpression;
        break;

      default:
        // binary
        left = {
          ast: Ast.AstType.BinaryOperation,
          operator: operator as any,
          left: left!,
          right,
        } satisfies Ast.BinaryOperation;
    }
  }

  return left;
}

export function tryParseIdentifier(context: ParseContext): Ast.Identifier | undefined {
  const maybeIdentifier = context.tokens[context.tokenIndex++];

  if (maybeIdentifier?.token !== Token.TokenType.Identifier) {
    context.tokenIndex--;
    return undefined;
  }

  return { ast: Ast.AstType.Identifier, token: maybeIdentifier };
}

export function tryParseLiteral(context: ParseContext): Ast.Literal | undefined {
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
}

export function* tryParseAssignment(context: ParseContext): Generator<Ast.Assignment> {
  const startIndex = context.tokenIndex;

  // Note: This is still performing depth first search by entering a new stack
  // and eventually recursively calling this function
  const lefts = tryParseExpression(context);
  for (const left of lefts) {
    const maybeOperator = context.tokens[context.tokenIndex++];

    if (maybeOperator === undefined) {
      context.tokenIndex = startIndex;
      continue;
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
      continue;
    }

    const rights = tryParseExpression(context);
    for (const right of rights) {
      yield {
        ast: Ast.AstType.Assignment,
        operator: maybeOperator,
        left,
        right,
      };
    }
  }
}

export function* tryParseUnaryOperation(context: ParseContext): Generator<Ast.UnaryOperation> {
  const startIndex = context.tokenIndex;

  const maybeOperator = context.tokens[context.tokenIndex++];

  if (maybeOperator === undefined) {
    context.tokenIndex = startIndex;
    return;
  }

  if (
    maybeOperator.token !== Token.TokenType.Increment &&
    maybeOperator.token !== Token.TokenType.Decrement &&
    maybeOperator.token !== Token.TokenType.Subtract &&
    maybeOperator.token !== Token.TokenType.Delete
  ) {
    context.tokenIndex = startIndex;
    return;
  }

  const expressions = tryParseExpression(context);
  for (const expression of expressions) {
    yield {
      ast: Ast.AstType.UnaryOperation,
      operator: maybeOperator,
      expression,
    };
  }
}

export function* tryParseBinaryOperation(context: ParseContext): Generator<Ast.BinaryOperation> {
  const startIndex = context.tokenIndex;

  const lefts = tryParseExpression(context);
  for (const left of lefts) {
    const maybeOperator = context.tokens[context.tokenIndex++];

    if (maybeOperator === undefined) {
      context.tokenIndex = startIndex;
      continue;
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

    const rights = tryParseExpression(context);
    for (const right of rights) {
      yield {
        ast: Ast.AstType.BinaryOperation,
        operator: maybeOperator,
        left,
        right,
      };
    }
  }
}

export function* tryParseConditionalExpression(
  context: ParseContext,
): Generator<Ast.ConditionalExpression> {
  const startIndex = context.tokenIndex;

  const conditions = tryParseExpression(context);
  for (const condition of conditions) {
    const maybeQuestion = context.tokens[context.tokenIndex++];

    if (maybeQuestion?.token !== Token.TokenType.Question) {
      context.tokenIndex = startIndex;
      continue;
    }

    const trueExpressions = tryParseExpression(context);
    for (const trueExpression of trueExpressions) {
      const maybeColon = context.tokens[context.tokenIndex++];

      if (maybeColon?.token !== Token.TokenType.Colon) {
        context.tokenIndex = startIndex;
        continue;
      }

      const falseExpressions = tryParseExpression(context);
      for (const falseExpression of falseExpressions) {
        yield {
          ast: Ast.AstType.ConditionalExpression,
          condition,
          trueExpression,
          falseExpression,
        };
      }
    }
  }
}

export function* tryParseFunctionCallExpression(
  context: ParseContext,
): Generator<Ast.FunctionCallExpression> {
  const expressions = tryParseExpression(context);
  for (const expression of expressions) {
    const tuples = tryParseTupleExpression(context);
    for (const tuple of tuples) {
      yield {
        ast: Ast.AstType.FunctionCallExpression,
        expression,
        arguments: tuple.elements,
      };
    }
  }
}

export function* tryParseMemberAccessExpression(
  context: ParseContext,
): Generator<Ast.MemberAccessExpression> {
  const startIndex = context.tokenIndex;

  const expressions = tryParseExpression(context);
  for (const expression of expressions) {
    const maybeMember = context.tokens[context.tokenIndex++];

    if (maybeMember?.token !== Token.TokenType.Member) {
      context.tokenIndex = startIndex;
      continue;
    }

    const memberIdentifiers = tryParseIdentifier(context);
    for (const memberIdentifier of memberIdentifiers) {
      yield {
        ast: Ast.AstType.MemberAccessExpression,
        expression,
        member: memberIdentifier,
      };
    }
  }
}

export function* tryParseIndexAccessExpression(
  context: ParseContext,
): Generator<Ast.IndexAccessExpression> {
  const startIndex = context.tokenIndex;

  const bases = tryParseExpression(context);
  for (const base of bases) {
    const maybeOpenBracket = context.tokens[context.tokenIndex++];

    if (maybeOpenBracket?.token !== Token.TokenType.OpenBracket) {
      context.tokenIndex = startIndex;
      continue;
    }

    const indexes = tryParseExpression(context);
    for (const index of indexes) {
      const maybeCloseBracket = context.tokens[context.tokenIndex++];

      if (maybeCloseBracket?.token !== Token.TokenType.CloseBracket) {
        context.tokenIndex = startIndex;
        continue;
      }

      yield {
        ast: Ast.AstType.IndexAccessExpression,
        base,
        index,
      };
    }
  }
}

export function* tryParseNewExpression(context: ParseContext): Generator<Ast.NewExpression> {
  const startIndex = context.tokenIndex;

  const maybeNew = context.tokens[context.tokenIndex++];

  if (maybeNew?.token !== Token.TokenType.New) {
    context.tokenIndex = startIndex;
    return;
  }

  const expressions = tryParseExpression(context);

  for (const expression of expressions) {
    yield {
      ast: Ast.AstType.NewExpression,
      expression,
    };
  }
}

export function* tryParseTupleExpression(context: ParseContext): Generator<Ast.TupleExpression> {
  const startIndex = context.tokenIndex;

  const maybeOpenParenthesis = context.tokens[context.tokenIndex++];
  if (maybeOpenParenthesis?.token !== Token.TokenType.OpenParenthesis) {
    context.tokenIndex = startIndex;
    return;
  }

  const maybeCloseParenthesis = context.tokens[context.tokenIndex];
  if (maybeCloseParenthesis?.token === Token.TokenType.CloseParenthesis) {
    context.tokenIndex++;

    yield {
      ast: Ast.AstType.TupleExpression,
      elements: [],
    };

    return;
  }

  const elements: Ast.Expression[] = [];
  function* _parseTuple(): Generator<Ast.TupleExpression> {
    const expressions = tryParseExpression(context);
    for (const expression of expressions) {
      elements.push(expression);

      const maybeCloseParenthesis = context.tokens[context.tokenIndex];

      if (maybeCloseParenthesis?.token === Token.TokenType.CloseParenthesis) {
        context.tokenIndex++;

        yield {
          ast: Ast.AstType.TupleExpression,
          elements,
        };
      } else {
        const maybeComma = context.tokens[context.tokenIndex];
        if (maybeComma?.token === Token.TokenType.Comma) {
          context.tokenIndex++;

          for (const result of _parseTuple()) {
            yield result;
          }
        }
      }
    }
  }

  for (const result of _parseTuple()) {
    yield result;
  }
}

export function* tryParseVariableDeclaration(
  context: ParseContext,
): Generator<Ast.VariableDeclaration> {
  const startIndex = context.tokenIndex;

  const type = tryParseType(context);
  if (type === undefined) {
    context.tokenIndex = startIndex;
    return;
  }

  let maybeLocation = context.tokens[context.tokenIndex++];

  if (
    maybeLocation?.token !== Token.TokenType.Storage &&
    maybeLocation?.token !== Token.TokenType.Memory &&
    maybeLocation?.token !== Token.TokenType.Calldata
  ) {
    context.tokenIndex--;
    maybeLocation = undefined;
  }

  const identifiers = tryParseIdentifier(context);
  for (const identifier of identifiers) {
    const maybeAssign = context.tokens[context.tokenIndex++];

    if (maybeAssign?.token !== Token.TokenType.Assign) {
      context.tokenIndex--;
      yield {
        ast: Ast.AstType.VariableDeclaration,
        type,
        location: maybeLocation,
        attributes: [],
        identifier: identifier.token,
        initializer: undefined,
      };
      continue;
    }

    const initializers = tryParseExpression(context);
    for (const initializer of initializers) {
      yield {
        ast: Ast.AstType.VariableDeclaration,
        type,
        location: maybeLocation,
        attributes: [],
        identifier: identifier.token,
        initializer,
      };
    }
  }
}

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

// @ts-expect-error
export const tryParseArrayType = (_context: ParseContext): Ast.ArrayType | undefined => {};

// @ts-expect-error
export const tryParseMapping = (_context: ParseContext): Ast.Mapping | undefined => {};
