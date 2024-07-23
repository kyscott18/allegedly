import { EOFError } from "./errors/eof";
import { ExpectTokenError } from "./errors/expectToken";
import { UnexpectTokenError } from "./errors/unexpectedToken";
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
    const defintion = parseDefinition(context);

    if (defintion === undefined) break;

    program.push(defintion);
  }

  return program;
};

// helpers

/** Expect `token` or throw error.  */
const expect = (context: ParseContext, token: Token.TokenType) => {
  const next = context.tokens[context.tokenIndex++];
  if (next?.token !== token) {
    throw new ExpectTokenError({
      expected: token,
      received: next?.token,
    });
  }
};

/** Return true and advance if we are at `token`, return false otherwise.  */
const eat = (context: ParseContext, token: Token.TokenType) => {
  if (context.tokens[context.tokenIndex]?.token === token) {
    context.tokenIndex++;
    return true;
  }
  return false;
};

const next = (context: ParseContext) => {
  const token = context.tokens[context.tokenIndex++];
  if (token === undefined) throw new EOFError();
  return token;
};

/** Look ahead at next token. */
const peek = (context: ParseContext) => {
  return context.tokens[context.tokenIndex];
};

const parseList = <T>(
  context: ParseContext,
  start: Token.TokenType,
  end: Token.TokenType,
  parser: (context: ParseContext) => T,
): T[] => {
  expect(context, start);

  let first = true;
  const elements: T[] = [];
  while (true) {
    if (eat(context, end)) return elements;

    if (first) {
      first = false;
    } else expect(context, Token.TokenType.Comma);

    elements.push(parser(context));
  }
};

// defintions

export const parseDefinition = (context: ParseContext): Ast.Definition => {
  return (
    parseFunctionDefinition(context) ??
    parseContractDefinition(context) ??
    parseEventDefinition(context) ??
    parseErrorDefinition(context) ??
    parseStructDefinition(context) ??
    parseModifierDefinition(context) ??
    undefined
  );
};

export const parseFunctionDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.FunctionDefinition => {};

export const parseContractDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.ContractDefinition => {};

export const parseEventDefinition = (context: ParseContext): Ast.EventDefinition => {
  expect(context, Token.TokenType.Event);

  const name = context.tokens[context.tokenIndex] as Token.Identifier;
  expect(context, Token.TokenType.Identifier);

  const parameters = parseList(
    context,
    Token.TokenType.OpenParenthesis,
    Token.TokenType.CloseParenthesis,
    parseVariableDeclaration,
  );

  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.EventDefinition, name, parameters };
};

export const parseErrorDefinition = (context: ParseContext): Ast.ErrorDefinition => {
  expect(context, Token.TokenType.Error);

  const name = context.tokens[context.tokenIndex] as Token.Identifier;
  expect(context, Token.TokenType.Identifier);

  const parameters = parseList(
    context,
    Token.TokenType.OpenParenthesis,
    Token.TokenType.CloseParenthesis,
    parseVariableDeclaration,
  );

  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.ErrorDefinition, name, parameters };
};

export const parseStructDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.StructDefinition => {};

export const parseModifierDefinition = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.ModifierDefinition => {};

export function parseVariableDeclaration(context: ParseContext): Ast.VariableDeclaration {
  const startIndex = context.tokenIndex;

  const type = parseType(context);
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

  const identifier = context.tokens[context.tokenIndex++];
  if (identifier?.token !== Token.TokenType.Identifier) {
    context.tokenIndex === startIndex;
    return undefined;
  }

  const maybeAssign = context.tokens[context.tokenIndex++];

  if (maybeAssign?.token !== Token.TokenType.Assign) {
    context.tokenIndex--;
    return {
      ast: Ast.AstType.VariableDeclaration,
      type,
      location: maybeLocation,
      attributes: [],
      identifier,
      initializer: undefined,
    };
  }

  const initializer = parseExpression(context);
  return {
    ast: Ast.AstType.VariableDeclaration,
    type,
    location: maybeLocation,
    attributes: [],
    identifier,
    initializer,
  };
}

// statements

export const parseStatement = (context: ParseContext): Ast.Statement => {
  return (
    parseExpressionStatement(context) ??
    parseBlockStatement(context) ??
    parseUncheckedBlockStatement(context) ??
    parseIfStatement(context) ??
    parseForStatement(context) ??
    parseWhileStatement(context) ??
    parseDoWhileStatement(context) ??
    parseBreakStatement(context) ??
    parseContinueStatement(context) ??
    parseEmitStatement(context) ??
    parseRevertStatement(context) ??
    parseReturnStatement(context) ??
    parsePlaceholderStatement(context) ??
    undefined
  );
};

export const parseExpressionStatement = (context: ParseContext): Ast.ExpressionStatement => {
  const expression = parseExpression(context);
  expect(context, Token.TokenType.Semicolon);
  return { ast: Ast.AstType.ExpressionStatement, expression };
};

export const parseBlockStatement = (context: ParseContext): Ast.BlockStatement => {
  // TODO(kyle) use parse list

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

    const statement = parseStatement(context);
    if (statement === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    statements.push(statement);
  }
};

export const parseUncheckedBlockStatement = (
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

    const statement = parseStatement(context);
    if (statement === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    statements.push(statement);
  }
};

// @ts-expect-error
export const parseIfStatement = (_context: ParseContext): Ast.IfStatement => {};

// @ts-expect-error
export const parseForStatement = (_context: ParseContext): Ast.ForStatement => {};

export const parseWhileStatement = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.WhileStatement => {};

export const parseDoWhileStatement = (
  _context: ParseContext,
  // @ts-expect-error
): Ast.DoWhileStatement => {};

export const parseBreakStatement = (context: ParseContext): Ast.BreakStatement => {
  expect(context, Token.TokenType.Break);
  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.BreakStatement };
};

export const parseContinueStatement = (context: ParseContext): Ast.ContinueStatement => {
  expect(context, Token.TokenType.Continue);
  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.ContinueStatement };
};

export const parseEmitStatement = (context: ParseContext): Ast.EmitStatement | undefined => {
  expect(context, Token.TokenType.Emit);

  const maybeEvent = parseExpression(context);
  if (maybeEvent?.ast !== Ast.AstType.FunctionCallExpression) throw new Error("TODO");

  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.EmitStatement, event: maybeEvent };
};

export const parseRevertStatement = (context: ParseContext): Ast.RevertStatement => {
  expect(context, Token.TokenType.Revert);

  const error = parseExpression(context);
  if (error?.ast !== Ast.AstType.FunctionCallExpression) throw new Error("TODO");

  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.RevertStatement, error };
};

export const parseReturnStatement = (context: ParseContext): Ast.ReturnStatement | undefined => {
  expect(context, Token.TokenType.Return);

  if (context.tokens[context.tokenIndex]?.token === Token.TokenType.Semicolon) {
    context.tokenIndex++;

    return {
      ast: Ast.AstType.ReturnStatement,
      expression: undefined,
    };
  }

  const expression = parseExpression(context);
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

export const parsePlaceholderStatement = (
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

// binding power for operator associativity and precendence
// https://docs.soliditylang.org/en/v0.8.26/cheatsheet.html#order-of-precedence-of-operators

const getPrefixBindingPower = (operator: Token.Token): number => {
  switch (operator.token) {
    case Token.TokenType.Increment:
    case Token.TokenType.Decrement:
    case Token.TokenType.Subtract:
    case Token.TokenType.Delete:
    case Token.TokenType.Not:
    case Token.TokenType.BitwiseNot:
      return 27;

    default:
      throw new UnrecognizedSymbolError({ symbol: operator.toString() });
  }
};

const getPostfixBindingPower = (operator: Token.Token): number | undefined => {
  switch (operator.token) {
    case Token.TokenType.Increment:
    case Token.TokenType.Decrement:
      return 29;

    case Token.TokenType.OpenBracket:
      return 29;

    default:
      return undefined;
  }
};

const getInfixBindingPower = (operator: Token.Token): [number, number] | undefined => {
  switch (operator.token) {
    case Token.TokenType.Assign:
    case Token.TokenType.AddAssign:
    case Token.TokenType.SubtractAssign:
    case Token.TokenType.MulAssign:
    case Token.TokenType.DivideAssign:
    case Token.TokenType.ModuloAssign:
    case Token.TokenType.BitwiseAndAssign:
    case Token.TokenType.BitwiseOrAssign:
    case Token.TokenType.BitwiseXOrAssign:
    case Token.TokenType.ShiftRightAssign:
    case Token.TokenType.ShiftLeftAssign:
      return [2, 1];

    case Token.TokenType.Question:
      return [4, 3];

    case Token.TokenType.Or:
      return [5, 6];

    case Token.TokenType.And:
      return [7, 8];

    case Token.TokenType.Equal:
    case Token.TokenType.NotEqual:
      return [9, 10];

    case Token.TokenType.Less:
    case Token.TokenType.More:
    case Token.TokenType.LessEqual:
    case Token.TokenType.MoreEqual:
      return [11, 12];

    case Token.TokenType.BitwiseOr:
      return [13, 14];

    case Token.TokenType.BitwiseXOr:
      return [15, 16];

    case Token.TokenType.BitwiseAnd:
      return [17, 18];

    case Token.TokenType.ShiftLeft:
    case Token.TokenType.ShiftRight:
      return [19, 20];

    case Token.TokenType.Add:
    case Token.TokenType.Subtract:
      return [21, 22];

    case Token.TokenType.Mul:
    case Token.TokenType.Divide:
    case Token.TokenType.Modulo:
      return [23, 24];

    case Token.TokenType.Power:
      return [25, 26];

    case Token.TokenType.Member:
      return [29, 30];

    default:
      return undefined;
  }
};

// expressions

export const parseExpression = (context: ParseContext, minBp = 0): Ast.Expression => {
  const left = _parseExpression(context, minBp);
  const functionCall = parseFunctionCallExpression(context, left);

  if (functionCall === undefined) return left;
  return functionCall;
};

const _parseExpression = (context: ParseContext, minBp: number): Ast.Expression => {
  const token = next(context);

  let left: Ast.Expression | undefined;
  switch (token.token) {
    case Token.TokenType.StringLiteral:
    case Token.TokenType.AddressLiteral:
    case Token.TokenType.HexLiteral:
    case Token.TokenType.NumberLiteral:
    case Token.TokenType.RationalNumberLiteral:
    case Token.TokenType.HexNumberLiteral:
    case Token.TokenType.BoolLiteral:
      left = { ast: Ast.AstType.Literal, token } satisfies Ast.Literal;
      break;

    case Token.TokenType.Identifier:
      left = { ast: Ast.AstType.Identifier, token } satisfies Ast.Identifier;
      break;

    // prefix unary operators
    case Token.TokenType.Increment:
    case Token.TokenType.Decrement:
    case Token.TokenType.Subtract:
    case Token.TokenType.Delete:
    case Token.TokenType.Not:
    case Token.TokenType.BitwiseNot:
      {
        const rBp = getPrefixBindingPower(token);
        const right = parseExpression(context, rBp);

        left = {
          ast: Ast.AstType.UnaryOperation,
          operator: token,
          expression: right,
          prefix: true,
        } satisfies Ast.UnaryOperation;
      }
      break;

    // case Token.TokenType.OpenParenthesis:
    //   left = parseExpression(context, 0);
    //   if (left === undefined) {
    //     context.tokenIndex = startIndex;
    //     return undefined;
    //   }

    //   if (context.tokens[context.tokenIndex]?.token === Token.TokenType.Comma) {
    //     const tuple = tryParseTupleExpression(context, left);
    //     if (tuple === undefined) {
    //       context.tokenIndex = startIndex;
    //       return undefined;
    //     }
    //     left = tuple;
    //     break;
    //   }

    //   if (context.tokens[context.tokenIndex++]?.token === Token.TokenType.CloseParenthesis) {
    //     break;
    //   }

    //   context.tokenIndex = startIndex;
    //   return undefined;

    case Token.TokenType.New:
      left = {
        ast: Ast.AstType.NewExpression,
        expression: parseExpression(context),
      } satisfies Ast.NewExpression;
      break;
  }

  if (left === undefined) throw new UnexpectTokenError(token);

  while (true) {
    const operator = peek(context);

    if (
      operator === undefined ||
      operator.token === Token.TokenType.Semicolon ||
      operator.token === Token.TokenType.Comma
    ) {
      break;
    }

    const postfixBp = getPostfixBindingPower(operator);
    if (postfixBp) {
      if (postfixBp < minBp) break;

      next(context);

      if (operator.token === Token.TokenType.OpenBracket) {
        const right = parseExpression(context, 0);
        expect(context, Token.TokenType.CloseBracket);
        left = { ast: Ast.AstType.IndexAccessExpression, base: left, index: right };
      } else {
        left = {
          ast: Ast.AstType.UnaryOperation,
          operator: operator as Token.Increment | Token.Decrement,
          expression: left,
          prefix: false,
        } satisfies Ast.UnaryOperation;
      }

      continue;
    }

    const infixBindingPower = getInfixBindingPower(operator);
    if (infixBindingPower === undefined) break;
    if (infixBindingPower[0] < minBp) break;

    next(context);

    if (operator.token === Token.TokenType.Question) {
      const middle = parseExpression(context, 0);
      expect(context, Token.TokenType.Colon);
      const right = parseExpression(context, infixBindingPower[1]);

      left = {
        ast: Ast.AstType.ConditionalExpression,
        condition: left,
        trueExpression: middle,
        falseExpression: right,
      } satisfies Ast.ConditionalExpression;
    } else {
      const right = parseExpression(context, infixBindingPower[1]);

      switch (operator.token) {
        case Token.TokenType.Member:
          if (right.ast !== Ast.AstType.Identifier) throw new Error("TODO");

          left = {
            ast: Ast.AstType.MemberAccessExpression,
            expression: left,
            member: right,
          } satisfies Ast.MemberAccessExpression;
          break;

        case Token.TokenType.Assign:
        case Token.TokenType.AddAssign:
        case Token.TokenType.SubtractAssign:
        case Token.TokenType.MulAssign:
        case Token.TokenType.DivideAssign:
        case Token.TokenType.ModuloAssign:
        case Token.TokenType.BitwiseAndAssign:
        case Token.TokenType.BitwiseOrAssign:
        case Token.TokenType.BitwiseXOrAssign:
        case Token.TokenType.ShiftRightAssign:
        case Token.TokenType.ShiftLeftAssign:
          left = {
            ast: Ast.AstType.Assignment,
            operator,
            left,
            right,
          } satisfies Ast.Assignment;
          break;

        default:
          left = {
            ast: Ast.AstType.BinaryOperation,
            operator: operator as Ast.BinaryOperation["operator"],
            left,
            right,
          } satisfies Ast.BinaryOperation;
      }
    }
  }

  return left;
};

const parseTupleExpression = (
  context: ParseContext,
  firstExpression: Ast.Expression,
): Ast.TupleExpression => {
  const elements: Ast.Expression[] = [firstExpression];

  while (true) {
    const maybeCommaOrCloseParenthesis = context.tokens[context.tokenIndex++];

    if (maybeCommaOrCloseParenthesis?.token === Token.TokenType.CloseParenthesis) {
      break;
    }

    if (maybeCommaOrCloseParenthesis?.token !== Token.TokenType.Comma) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    const element = parseExpression(context);

    elements.push(element);

    // TODO(kyle) maybe missing expression: continue;
  }

  return { ast: Ast.AstType.TupleExpression, elements };
};

function parseFunctionCallExpression(
  context: ParseContext,
  expression: Ast.Expression,
): Ast.FunctionCallExpression | undefined {
  // const _arguments = parseList(
  //   context,
  //   Token.TokenType.OpenParenthesis,
  //   Token.TokenType.CloseParenthesis,
  //   parseExpression,
  // );

  const startIndex = context.tokenIndex;

  if (context.tokens[context.tokenIndex++]?.token !== Token.TokenType.OpenParenthesis) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (context.tokens[context.tokenIndex]?.token === Token.TokenType.CloseParenthesis) {
    context.tokenIndex++;
    return { ast: Ast.AstType.FunctionCallExpression, expression, arguments: [] };
  }

  const first = parseExpression(context);
  if (first === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const _arguments = parseTupleExpression(context, first);
  if (_arguments === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  // // TODO(kyle) check for close parens

  return { ast: Ast.AstType.FunctionCallExpression, expression, arguments: _arguments.elements };
}

// types

export const parseType = (context: ParseContext): Ast.Type => {
  return (
    parseElementaryType(context) ?? parseArrayType(context) ?? parseMapping(context) ?? undefined
  );
};

export const parseElementaryType = (context: ParseContext): Ast.ElementaryType => {
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
export const parseArrayType = (_context: ParseContext): Ast.ArrayType => {};

// @ts-expect-error
export const parseMapping = (_context: ParseContext): Ast.Mapping => {};
