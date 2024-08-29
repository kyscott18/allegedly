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
      case Token.disc.Contract:
      case Token.disc.Interface:
      case Token.disc.Library:
        program.push(parseContractDefinition(context));
        break;

      case Token.disc.Function:
        program.push(parseFunctionDefinition(context));
        break;

      case Token.disc.Event:
        program.push(parseEventDefinition(context));
        break;

      case Token.disc.Error:
        program.push(parseErrorDefinition(context));
        break;

      default:
        throw new UnexpectTokenError(peek(context)!);
    }
  }
};

// helpers

/** Expect `token` or throw error.  */
const expect = (context: ParseContext, token: Token.disc) => {
  const next = context.tokens[context.tokenIndex++];
  if (next?.token !== token) {
    throw new ExpectTokenError({
      expected: token,
      received: next?.token,
    });
  }
};

/** Return true and advance if we are at `token`, return false otherwise.  */
const eat = (context: ParseContext, token: Token.disc) => {
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
  start: Token.disc,
  end: Token.disc,
  parser: (context: ParseContext) => T,
): T[] => {
  expect(context, start);

  let first = true;
  const elements: T[] = [];
  while (true) {
    if (eat(context, end)) return elements;

    if (first) {
      first = false;
    } else expect(context, Token.disc.Comma);

    elements.push(parser(context));
  }
};

// defintions

export const parseFunctionDefinition = (context: ParseContext): Ast.FunctionDefinition => {
  const kind = next(context);
  if (kind.token === Token.disc.Function) {
    const name = peek(context) as Token.Identifier;
    expect(context, Token.disc.Identifier);

    const parameters = parseList(
      context,
      Token.disc.OpenParenthesis,
      Token.disc.CloseParenthesis,
      parseParameter,
    );

    let visibility: Ast.Visibility | undefined;
    let mutability: Ast.Mutability | undefined;

    let token = peek(context) as Ast.Visibility | Ast.Mutability;
    if (
      eat(context, Token.disc.External) ||
      eat(context, Token.disc.Public) ||
      eat(context, Token.disc.Internal) ||
      eat(context, Token.disc.Private)
    ) {
      visibility = token as Ast.Visibility;
    } else if (
      eat(context, Token.disc.Pure) ||
      eat(context, Token.disc.View) ||
      eat(context, Token.disc.Payable) ||
      eat(context, Token.disc.Nonpayable)
    ) {
      mutability = token as Ast.Mutability;
    }

    token = peek(context) as Ast.Visibility | Ast.Mutability;
    if (
      visibility === undefined &&
      (eat(context, Token.disc.External) ||
        eat(context, Token.disc.Public) ||
        eat(context, Token.disc.Internal) ||
        eat(context, Token.disc.Private))
    ) {
      visibility = token as Ast.Visibility;
    } else if (
      mutability === undefined &&
      (eat(context, Token.disc.Pure) ||
        eat(context, Token.disc.View) ||
        eat(context, Token.disc.Payable) ||
        eat(context, Token.disc.Nonpayable))
    ) {
      mutability = token as Ast.Mutability;
    }

    if (visibility === undefined) throw new UnexpectTokenError(token);

    if (eat(context, Token.disc.Returns)) {
      const returns = parseList(
        context,
        Token.disc.OpenParenthesis,
        Token.disc.CloseParenthesis,
        parseParameter,
      );

      let body: Ast.BlockStatement | undefined;
      if (eat(context, Token.disc.Semicolon) === false) {
        body = parseBlockStatement(context);
      }

      return {
        ast: Ast.disc.FunctionDefinition,
        kind,
        visibility,
        mutability: mutability ?? { token: Token.disc.Nonpayable },
        modifiers: [],
        parameters,
        returns,
        name,
        body,
      };
    }

    return {
      ast: Ast.disc.FunctionDefinition,
      kind,
      visibility,
      mutability: mutability ?? { token: Token.disc.Nonpayable },
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
  const kind = next(context) as Ast.ContractDefinition["kind"];

  if (
    kind.token !== Token.disc.Contract &&
    kind.token !== Token.disc.Interface &&
    kind.token !== Token.disc.Library
  ) {
    throw new UnexpectTokenError(kind);
  }

  const name = peek(context) as Token.Identifier;
  expect(context, Token.disc.Identifier);

  expect(context, Token.disc.OpenCurlyBrace);

  const nodes: Ast.ContractDefinition["nodes"] = [];
  while (true) {
    if (eat(context, Token.disc.CloseCurlyBrace)) {
      return { ast: Ast.disc.ContractDefinition, kind, name, nodes };
    }

    switch (peek(context)?.token) {
      case Token.disc.Function:
        nodes.push(parseFunctionDefinition(context));
        break;

      case Token.disc.Event:
        nodes.push(parseEventDefinition(context));
        break;

      case Token.disc.Error:
        nodes.push(parseErrorDefinition(context));
        break;

      case Token.disc.Address:
      case Token.disc.String:
      case Token.disc.Uint:
      case Token.disc.Int:
      case Token.disc.Byte:
      case Token.disc.Bytes:
      case Token.disc.Bool:
      case Token.disc.Mapping:
        nodes.push(parseVariableDefinition(context));
        expect(context, Token.disc.Semicolon);
        break;

      case undefined:
        throw new EOFError();

      default:
        throw new UnexpectTokenError(peek(context)!);
    }
  }
};

export const parseEventDefinition = (context: ParseContext): Ast.EventDefinition => {
  expect(context, Token.disc.Event);

  const name = context.tokens[context.tokenIndex] as Token.Identifier;
  expect(context, Token.disc.Identifier);

  const parameters = parseList(
    context,
    Token.disc.OpenParenthesis,
    Token.disc.CloseParenthesis,
    parseParameter,
  );

  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.EventDefinition, name, parameters };
};

export const parseErrorDefinition = (context: ParseContext): Ast.ErrorDefinition => {
  expect(context, Token.disc.Error);

  const name = context.tokens[context.tokenIndex] as Token.Identifier;
  expect(context, Token.disc.Identifier);

  const parameters = parseList(
    context,
    Token.disc.OpenParenthesis,
    Token.disc.CloseParenthesis,
    parseParameter,
  );

  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.ErrorDefinition, name, parameters };
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
  expect(context, Token.disc.Identifier);

  return {
    ast: Ast.disc.VariableDefinition,
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
    eat(context, Token.disc.Storage) === false &&
    eat(context, Token.disc.Memory) === false &&
    eat(context, Token.disc.Calldata) === false
  ) {
    maybeLocation = undefined;
  }

  const identifier = peek(context) as Token.Identifier;
  expect(context, Token.disc.Identifier);

  if (eat(context, Token.disc.Assign) === false) {
    expect(context, Token.disc.Semicolon);
    return {
      ast: Ast.disc.VariableDeclaration,
      type,
      identifier,
      location: maybeLocation,
      initializer: undefined,
    };
  }

  const initializer = parseExpression(context);
  expect(context, Token.disc.Semicolon);
  return {
    ast: Ast.disc.VariableDeclaration,
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
    eat(context, Token.disc.Storage) === false &&
    eat(context, Token.disc.Memory) === false &&
    eat(context, Token.disc.Calldata) === false
  ) {
    maybeLocation = undefined;
  }

  const identifier = peek(context) as Token.Identifier;

  return {
    ast: Ast.disc.Parameter,
    type,
    identifier: eat(context, Token.disc.Identifier) ? identifier : undefined,
    location: maybeLocation,
    isIndexed: false,
  };
};

// statements

export const parseStatement = (context: ParseContext): Ast.Statement => {
  const token = peek(context);

  switch (token?.token) {
    case Token.disc.Address:
    case Token.disc.String:
    case Token.disc.Uint:
    case Token.disc.Int:
    case Token.disc.Byte:
    case Token.disc.Bytes:
    case Token.disc.Bool: {
      const index = context.tokenIndex;
      try {
        return parseVariableDeclaration(context);
      } catch {
        context.tokenIndex = index;
        return parseExpressionStatement(context);
      }
    }

    case Token.disc.OpenCurlyBrace:
      return parseBlockStatement(context);

    case Token.disc.Unchecked:
      return parseUncheckedBlockStatement(context);

    case Token.disc.If:
      return parseIfStatement(context);

    case Token.disc.For:
      return parseForStatement(context);

    case Token.disc.While:
      return parseWhileStatement(context);

    case Token.disc.Do:
      return parseDoWhileStatement(context);

    case Token.disc.Break:
      return parseBreakStatement(context);

    case Token.disc.Continue:
      return parseContinueStatement(context);

    case Token.disc.Emit:
      return parseEmitStatement(context);

    case Token.disc.Revert:
      return parseRevertStatement(context);

    case Token.disc.Return:
      return parseReturnStatement(context);

    case undefined:
      throw new EOFError();

    default:
      return parseExpressionStatement(context);
  }
};

export const parseExpressionStatement = (context: ParseContext): Ast.ExpressionStatement => {
  const expression = parseExpression(context);
  expect(context, Token.disc.Semicolon);
  return { ast: Ast.disc.ExpressionStatement, expression };
};

export const parseBlockStatement = (context: ParseContext): Ast.BlockStatement => {
  expect(context, Token.disc.OpenCurlyBrace);

  const statements: Ast.Statement[] = [];
  while (true) {
    if (eat(context, Token.disc.CloseCurlyBrace)) {
      return { ast: Ast.disc.BlockStatement, statements };
    }
    statements.push(parseStatement(context));
  }
};

export const parseUncheckedBlockStatement = (
  context: ParseContext,
): Ast.UncheckedBlockStatement => {
  expect(context, Token.disc.Unchecked);
  expect(context, Token.disc.OpenCurlyBrace);

  const statements: Ast.Statement[] = [];
  while (true) {
    if (eat(context, Token.disc.CloseCurlyBrace)) {
      return { ast: Ast.disc.UncheckedBlockStatement, statements };
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
  expect(context, Token.disc.Break);
  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.BreakStatement };
};

export const parseContinueStatement = (context: ParseContext): Ast.ContinueStatement => {
  expect(context, Token.disc.Continue);
  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.ContinueStatement };
};

export const parseEmitStatement = (context: ParseContext): Ast.EmitStatement => {
  expect(context, Token.disc.Emit);

  const maybeEvent = parseExpression(context);
  if (maybeEvent?.ast !== Ast.disc.FunctionCallExpression) throw new Error("TODO");

  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.EmitStatement, event: maybeEvent };
};

export const parseRevertStatement = (context: ParseContext): Ast.RevertStatement => {
  expect(context, Token.disc.Revert);

  const error = parseExpression(context);
  if (error?.ast !== Ast.disc.FunctionCallExpression) throw new Error("TODO");

  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.RevertStatement, error };
};

export const parseReturnStatement = (context: ParseContext): Ast.ReturnStatement => {
  expect(context, Token.disc.Return);

  if (eat(context, Token.disc.Semicolon)) {
    return {
      ast: Ast.disc.ReturnStatement,
      expression: undefined,
    };
  }

  const expression = parseExpression(context);
  expect(context, Token.disc.Semicolon);

  return {
    ast: Ast.disc.ReturnStatement,
    expression,
  };
};

export const parsePlaceholderStatement = (context: ParseContext): Ast.PlaceholderStatement => {
  expect(context, Token.disc.Placeholder);
  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.PlaceholderStatement };
};

// binding power for operator associativity and precendence
// https://docs.soliditylang.org/en/v0.8.26/cheatsheet.html#order-of-precedence-of-operators

const getPrefixBindingPower = (operator: Token.Token): number => {
  switch (operator.token) {
    case Token.disc.Increment:
    case Token.disc.Decrement:
    case Token.disc.Subtract:
    case Token.disc.Delete:
    case Token.disc.Not:
    case Token.disc.BitwiseNot:
      return 27;

    default:
      throw new UnrecognizedSymbolError({ symbol: operator.toString() });
  }
};

const getPostfixBindingPower = (operator: Token.Token): number | undefined => {
  switch (operator.token) {
    case Token.disc.Increment:
    case Token.disc.Decrement:
      return 29;

    case Token.disc.OpenBracket:
      return 29;

    case Token.disc.OpenParenthesis:
      return 29;

    default:
      return undefined;
  }
};

const getInfixBindingPower = (operator: Token.Token): [number, number] | undefined => {
  switch (operator.token) {
    case Token.disc.Assign:
    case Token.disc.AddAssign:
    case Token.disc.SubtractAssign:
    case Token.disc.MulAssign:
    case Token.disc.DivideAssign:
    case Token.disc.ModuloAssign:
    case Token.disc.BitwiseAndAssign:
    case Token.disc.BitwiseOrAssign:
    case Token.disc.BitwiseXOrAssign:
    case Token.disc.ShiftRightAssign:
    case Token.disc.ShiftLeftAssign:
      return [2, 1];

    case Token.disc.Question:
      return [4, 3];

    case Token.disc.Or:
      return [5, 6];

    case Token.disc.And:
      return [7, 8];

    case Token.disc.Equal:
    case Token.disc.NotEqual:
      return [9, 10];

    case Token.disc.Less:
    case Token.disc.More:
    case Token.disc.LessEqual:
    case Token.disc.MoreEqual:
      return [11, 12];

    case Token.disc.BitwiseOr:
      return [13, 14];

    case Token.disc.BitwiseXOr:
      return [15, 16];

    case Token.disc.BitwiseAnd:
      return [17, 18];

    case Token.disc.ShiftLeft:
    case Token.disc.ShiftRight:
      return [19, 20];

    case Token.disc.Add:
    case Token.disc.Subtract:
      return [21, 22];

    case Token.disc.Mul:
    case Token.disc.Divide:
    case Token.disc.Modulo:
      return [23, 24];

    case Token.disc.Power:
      return [25, 26];

    case Token.disc.Member:
      return [29, 30];

    default:
      return undefined;
  }
};

// expressions

export const parseExpression = (context: ParseContext, minBp = 0): Ast.Expression => {
  const token = next(context);

  let left: Ast.Expression | undefined;
  switch (token.token) {
    case Token.disc.StringLiteral:
    case Token.disc.AddressLiteral:
    case Token.disc.HexLiteral:
    case Token.disc.NumberLiteral:
    case Token.disc.RationalNumberLiteral:
    case Token.disc.HexNumberLiteral:
    case Token.disc.BoolLiteral:
      left = { ast: Ast.disc.Literal, token } satisfies Ast.Literal;
      break;

    case Token.disc.Identifier:
    case Token.disc.Address:
    case Token.disc.String:
    case Token.disc.Uint:
    case Token.disc.Int:
    case Token.disc.Byte:
    case Token.disc.Bytes:
    case Token.disc.Bool:
      left = { ast: Ast.disc.Identifier, token } satisfies Ast.Identifier;
      break;

    // prefix unary operators
    case Token.disc.Increment:
    case Token.disc.Decrement:
    case Token.disc.Subtract:
    case Token.disc.Delete:
    case Token.disc.Not:
    case Token.disc.BitwiseNot:
      {
        const rBp = getPrefixBindingPower(token);
        const right = parseExpression(context, rBp);

        left = {
          ast: Ast.disc.UnaryOperation,
          operator: token,
          expression: right,
          prefix: true,
        } satisfies Ast.UnaryOperation;
      }
      break;

    case Token.disc.OpenParenthesis:
      left = parseExpression(context, 0);

      if (peek(context)?.token === Token.disc.Comma) {
        const tuple = parseTupleExpression(context, left);
        left = tuple;
        break;
      }

      expect(context, Token.disc.CloseParenthesis);

      break;

    case Token.disc.New:
      left = {
        ast: Ast.disc.NewExpression,
        expression: parseExpression(context),
      } satisfies Ast.NewExpression;
      break;
  }

  if (left === undefined) throw new UnexpectTokenError(token);

  while (true) {
    const operator = peek(context);

    if (
      operator === undefined ||
      operator.token === Token.disc.Semicolon ||
      operator.token === Token.disc.Comma
    ) {
      break;
    }

    const postfixBp = getPostfixBindingPower(operator);
    if (postfixBp) {
      if (postfixBp < minBp) break;

      next(context);

      if (operator.token === Token.disc.OpenBracket) {
        const right = parseExpression(context, 0);
        expect(context, Token.disc.CloseBracket);
        left = { ast: Ast.disc.IndexAccessExpression, base: left, index: right };
      } else if (operator.token === Token.disc.OpenParenthesis) {
        context.tokenIndex--;
        const right = parseList(
          context,
          Token.disc.OpenParenthesis,
          Token.disc.CloseParenthesis,
          parseExpression,
        );
        left = { ast: Ast.disc.FunctionCallExpression, expression: left, arguments: right };
      } else {
        left = {
          ast: Ast.disc.UnaryOperation,
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

    if (operator.token === Token.disc.Question) {
      const middle = parseExpression(context, 0);
      expect(context, Token.disc.Colon);
      const right = parseExpression(context, infixBindingPower[1]);

      left = {
        ast: Ast.disc.ConditionalExpression,
        condition: left,
        trueExpression: middle,
        falseExpression: right,
      } satisfies Ast.ConditionalExpression;
    } else {
      const right = parseExpression(context, infixBindingPower[1]);

      switch (operator.token) {
        case Token.disc.Member:
          if (right.ast !== Ast.disc.Identifier) throw new Error("TODO");

          left = {
            ast: Ast.disc.MemberAccessExpression,
            expression: left,
            member: right,
          } satisfies Ast.MemberAccessExpression;
          break;

        case Token.disc.Assign:
        case Token.disc.AddAssign:
        case Token.disc.SubtractAssign:
        case Token.disc.MulAssign:
        case Token.disc.DivideAssign:
        case Token.disc.ModuloAssign:
        case Token.disc.BitwiseAndAssign:
        case Token.disc.BitwiseOrAssign:
        case Token.disc.BitwiseXOrAssign:
        case Token.disc.ShiftRightAssign:
        case Token.disc.ShiftLeftAssign:
          left = {
            ast: Ast.disc.Assignment,
            operator,
            left,
            right,
          } satisfies Ast.Assignment;
          break;

        default:
          left = {
            ast: Ast.disc.BinaryOperation,
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
    if (eat(context, Token.disc.CloseParenthesis)) {
      return { ast: Ast.disc.TupleExpression, elements };
    }
    expect(context, Token.disc.Comma);
    elements.push(parseExpression(context));
  }
};

// types

export const parseType = (context: ParseContext): Ast.Type => {
  return parseElementaryType(context);
};

export const parseElementaryType = (context: ParseContext): Ast.ElementaryType => {
  const token = next(context);
  switch (token?.token) {
    case Token.disc.Address:
    case Token.disc.String:
    case Token.disc.Uint:
    case Token.disc.Int:
    case Token.disc.Byte:
    case Token.disc.Bytes:
    case Token.disc.Bool:
    case Token.disc.Mapping:
      return { ast: Ast.disc.ElementaryType, type: token as Ast.ElementaryType["type"] };

    default:
      throw new UnexpectTokenError(token!);
  }
};

// @ts-expect-error
export const parseArrayType = (_context: ParseContext): Ast.ArrayType => {};

// @ts-expect-error
export const parseMapping = (_context: ParseContext): Ast.Mapping => {};
