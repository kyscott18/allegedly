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

  while (true) {
    const token = peek(context);
    if (token === undefined) return program;

    switch (token?.token) {
      case Token.TokenType.Contract:
        program.push(parseContractDefinition(context));
        break;

      case Token.TokenType.Function:
        program.push(parseFunctionDefinition(context));
        break;

      case Token.TokenType.Event:
        program.push(parseEventDefinition(context));
        break;

      case Token.TokenType.Error:
        program.push(parseErrorDefinition(context));
        break;

      default:
        throw new UnexpectTokenError(peek(context)!);
    }
  }
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

export const parseFunctionDefinition = (context: ParseContext): Ast.FunctionDefinition => {
  const kind = next(context);
  if (kind.token === Token.TokenType.Function) {
    const name = peek(context) as Token.Identifier;
    expect(context, Token.TokenType.Identifier);

    const parameters = parseList(
      context,
      Token.TokenType.OpenParenthesis,
      Token.TokenType.CloseParenthesis,
      parseParameter,
    );

    let visibility: Ast.Visibility | undefined;
    let mutability: Ast.Mutability | undefined;

    let token = peek(context) as Ast.Visibility | Ast.Mutability;
    if (
      eat(context, Token.TokenType.External) ||
      eat(context, Token.TokenType.Public) ||
      eat(context, Token.TokenType.Internal) ||
      eat(context, Token.TokenType.Private)
    ) {
      visibility = token as Ast.Visibility;
    } else if (
      eat(context, Token.TokenType.Pure) ||
      eat(context, Token.TokenType.View) ||
      eat(context, Token.TokenType.Payable) ||
      eat(context, Token.TokenType.Nonpayable)
    ) {
      mutability = token as Ast.Mutability;
    }

    token = peek(context) as Ast.Visibility | Ast.Mutability;
    if (
      visibility === undefined &&
      (eat(context, Token.TokenType.External) ||
        eat(context, Token.TokenType.Public) ||
        eat(context, Token.TokenType.Internal) ||
        eat(context, Token.TokenType.Private))
    ) {
      visibility = token as Ast.Visibility;
    } else if (
      mutability === undefined &&
      (eat(context, Token.TokenType.Pure) ||
        eat(context, Token.TokenType.View) ||
        eat(context, Token.TokenType.Payable) ||
        eat(context, Token.TokenType.Nonpayable))
    ) {
      mutability = token as Ast.Mutability;
    }

    if (visibility === undefined) throw new UnexpectTokenError(token);

    if (eat(context, Token.TokenType.Returns)) {
      const returns = parseList(
        context,
        Token.TokenType.OpenParenthesis,
        Token.TokenType.CloseParenthesis,
        parseParameter,
      );

      return {
        ast: Ast.AstType.FunctionDefinition,
        kind,
        visibility,
        mutability: mutability ?? { token: Token.TokenType.Nonpayable },
        modifiers: [],
        parameters,
        returns,
        name,
        body: parseBlockStatement(context),
      };
    }

    return {
      ast: Ast.AstType.FunctionDefinition,
      kind,
      visibility,
      mutability: mutability ?? { token: Token.TokenType.Nonpayable },
      modifiers: [],
      parameters,
      returns: [],
      name,
      body: parseBlockStatement(context),
    };
  }

  throw new UnexpectTokenError(peek(context)!);
};

export const parseContractDefinition = (context: ParseContext): Ast.ContractDefinition => {
  const kind = peek(context) as Ast.ContractDefinition["kind"];
  expect(context, Token.TokenType.Contract);

  const name = peek(context) as Token.Identifier;
  expect(context, Token.TokenType.Identifier);

  expect(context, Token.TokenType.OpenCurlyBrace);

  const nodes: Ast.ContractDefinition["nodes"] = [];
  while (true) {
    if (eat(context, Token.TokenType.CloseCurlyBrace)) {
      return { ast: Ast.AstType.ContractDefinition, kind, name, nodes };
    }

    switch (peek(context)?.token) {
      case Token.TokenType.Function:
        nodes.push(parseFunctionDefinition(context));
        break;

      case Token.TokenType.Event:
        nodes.push(parseEventDefinition(context));
        break;

      case Token.TokenType.Error:
        nodes.push(parseErrorDefinition(context));
        break;

      case Token.TokenType.Address:
      case Token.TokenType.String:
      case Token.TokenType.Uint:
      case Token.TokenType.Int:
      case Token.TokenType.Byte:
      case Token.TokenType.Bytes:
      case Token.TokenType.Bool:
      case Token.TokenType.Mapping:
        nodes.push(parseVariableDefinition(context));
        expect(context, Token.TokenType.Semicolon);
        break;

      case undefined:
        throw new EOFError();

      default:
        throw new UnexpectTokenError(peek(context)!);
    }
  }
};

export const parseEventDefinition = (context: ParseContext): Ast.EventDefinition => {
  expect(context, Token.TokenType.Event);

  const name = context.tokens[context.tokenIndex] as Token.Identifier;
  expect(context, Token.TokenType.Identifier);

  const parameters = parseList(
    context,
    Token.TokenType.OpenParenthesis,
    Token.TokenType.CloseParenthesis,
    parseParameter,
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
    parseParameter,
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

export const parseVariableDefinition = (context: ParseContext): Ast.VariableDefintion => {
  const type = parseType(context);

  const identifier = peek(context) as Token.Identifier;
  expect(context, Token.TokenType.Identifier);

  return {
    ast: Ast.AstType.VariableDefinition,
    type,
    identifier,
    isConstant: false,
    isImmutable: false,
    visibility: undefined,
  };
};

export const parseVariableDeclaration = (context: ParseContext): Ast.VariableDeclaration => {
  const type = parseType(context);

  let maybeLocation = peek(context) as Token.Storage | Token.Memory | Token.Calldata | undefined;
  if (
    eat(context, Token.TokenType.Storage) === false &&
    eat(context, Token.TokenType.Memory) === false &&
    eat(context, Token.TokenType.Calldata) === false
  ) {
    maybeLocation = undefined;
  }

  const identifier = peek(context) as Token.Identifier;
  expect(context, Token.TokenType.Identifier);

  if (eat(context, Token.TokenType.Assign) === false) {
    expect(context, Token.TokenType.Semicolon);
    return {
      ast: Ast.AstType.VariableDeclaration,
      type,
      identifier,
      location: maybeLocation,
      initializer: undefined,
    };
  }

  const initializer = parseExpression(context);
  expect(context, Token.TokenType.Semicolon);
  return {
    ast: Ast.AstType.VariableDeclaration,
    type,
    identifier,
    location: maybeLocation,
    initializer,
  };
};

export const parseParameter = (context: ParseContext): Ast.Parameter => {
  const type = parseType(context);

  let maybeLocation = peek(context) as Token.Storage | Token.Memory | Token.Calldata | undefined;
  if (
    eat(context, Token.TokenType.Storage) === false &&
    eat(context, Token.TokenType.Memory) === false &&
    eat(context, Token.TokenType.Calldata) === false
  ) {
    maybeLocation = undefined;
  }

  const identifier = peek(context) as Token.Identifier;

  return {
    ast: Ast.AstType.Parameter,
    type,
    identifier: eat(context, Token.TokenType.Identifier) ? identifier : undefined,
    location: maybeLocation,
    isIndexed: false,
  };
};

// statements

export const parseStatement = (context: ParseContext): Ast.Statement => {
  const token = peek(context);

  switch (token?.token) {
    case Token.TokenType.Address:
    case Token.TokenType.String:
    case Token.TokenType.Uint:
    case Token.TokenType.Int:
    case Token.TokenType.Byte:
    case Token.TokenType.Bytes:
    case Token.TokenType.Bool:
      return parseVariableDeclaration(context);

    case Token.TokenType.OpenCurlyBrace:
      return parseBlockStatement(context);

    case Token.TokenType.Unchecked:
      return parseUncheckedBlockStatement(context);

    case Token.TokenType.If:
      return parseIfStatement(context);

    case Token.TokenType.For:
      return parseForStatement(context);

    case Token.TokenType.While:
      return parseWhileStatement(context);

    case Token.TokenType.Do:
      return parseDoWhileStatement(context);

    case Token.TokenType.Break:
      return parseBreakStatement(context);

    case Token.TokenType.Continue:
      return parseContinueStatement(context);

    case Token.TokenType.Emit:
      return parseEmitStatement(context);

    case Token.TokenType.Revert:
      return parseRevertStatement(context);

    case Token.TokenType.Return:
      return parseReturnStatement(context);

    case undefined:
      throw new EOFError();

    default:
      return parseExpressionStatement(context);
  }
};

export const parseExpressionStatement = (context: ParseContext): Ast.ExpressionStatement => {
  const expression = parseExpression(context);
  expect(context, Token.TokenType.Semicolon);
  return { ast: Ast.AstType.ExpressionStatement, expression };
};

export const parseBlockStatement = (context: ParseContext): Ast.BlockStatement => {
  expect(context, Token.TokenType.OpenCurlyBrace);

  const statements: Ast.Statement[] = [];
  while (true) {
    if (eat(context, Token.TokenType.CloseCurlyBrace)) {
      return { ast: Ast.AstType.BlockStatement, statements };
    }
    statements.push(parseStatement(context));
  }
};

export const parseUncheckedBlockStatement = (
  context: ParseContext,
): Ast.UncheckedBlockStatement => {
  expect(context, Token.TokenType.Unchecked);
  expect(context, Token.TokenType.OpenCurlyBrace);

  const statements: Ast.Statement[] = [];
  while (true) {
    if (eat(context, Token.TokenType.CloseCurlyBrace)) {
      return { ast: Ast.AstType.UncheckedBlockStatement, statements };
    }
    statements.push(parseStatement(context));
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

export const parseEmitStatement = (context: ParseContext): Ast.EmitStatement => {
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

export const parseReturnStatement = (context: ParseContext): Ast.ReturnStatement => {
  expect(context, Token.TokenType.Return);

  if (eat(context, Token.TokenType.Semicolon)) {
    return {
      ast: Ast.AstType.ReturnStatement,
      expression: undefined,
    };
  }

  const expression = parseExpression(context);
  expect(context, Token.TokenType.Semicolon);

  return {
    ast: Ast.AstType.ReturnStatement,
    expression,
  };
};

export const parsePlaceholderStatement = (context: ParseContext): Ast.PlaceholderStatement => {
  expect(context, Token.TokenType.Placeholder);
  expect(context, Token.TokenType.Semicolon);

  return { ast: Ast.AstType.PlaceholderStatement };
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
  const index = context.tokenIndex;
  try {
    return parseFunctionCallExpression(context, left);
  } catch {
    context.tokenIndex = index;
    return left;
  }
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

    case Token.TokenType.OpenParenthesis:
      left = parseExpression(context, 0);

      if (peek(context)?.token === Token.TokenType.Comma) {
        const tuple = parseTupleExpression(context, left);
        left = tuple;
        break;
      }

      expect(context, Token.TokenType.CloseParenthesis);

      break;

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
    if (eat(context, Token.TokenType.CloseParenthesis)) {
      return { ast: Ast.AstType.TupleExpression, elements };
    }
    expect(context, Token.TokenType.Comma);
    elements.push(parseExpression(context));
  }
};

const parseFunctionCallExpression = (
  context: ParseContext,
  expression: Ast.Expression,
): Ast.FunctionCallExpression => {
  const _arguments = parseList(
    context,
    Token.TokenType.OpenParenthesis,
    Token.TokenType.CloseParenthesis,
    parseExpression,
  );

  return { ast: Ast.AstType.FunctionCallExpression, expression, arguments: _arguments };
};

// types

export const parseType = (context: ParseContext): Ast.Type => {
  return parseElementaryType(context);
};

export const parseElementaryType = (context: ParseContext): Ast.ElementaryType => {
  const token = next(context);
  switch (token?.token) {
    case Token.TokenType.Address:
    case Token.TokenType.String:
    case Token.TokenType.Uint:
    case Token.TokenType.Int:
    case Token.TokenType.Byte:
    case Token.TokenType.Bytes:
    case Token.TokenType.Bool:
    case Token.TokenType.Mapping:
      return { ast: Ast.AstType.ElementaryType, type: token as Ast.ElementaryType["type"] };

    default:
      throw new UnexpectTokenError(token!);
  }
};

// @ts-expect-error
export const parseArrayType = (_context: ParseContext): Ast.ArrayType => {};

// @ts-expect-error
export const parseMapping = (_context: ParseContext): Ast.Mapping => {};
