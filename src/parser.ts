import { EOFError } from "./errors/eof";
import { ExpectTokenError } from "./errors/expectToken";
import { NotImplementedError } from "./errors/notImplemented";
import { UnexpectExpressionError } from "./errors/unexpectedExpression";
import { UnexpectTokenError } from "./errors/unexpectedToken";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import type { SourceLocation } from "./types/utils";

export type ParseContext = {
  source: string;
  tokens: Token.Token[];
  tokenIndex: number;
};

export const parse = (source: string, tokens: Token.Token[]): Ast.Program => {
  const program: Ast.Program = [];
  const context = { source, tokens, tokenIndex: 0 };

  while (true) {
    const token = peek(context);
    if (token === undefined) return program;

    switch (token?.token) {
      case Token.disc.Abstract:
      case Token.disc.Contract:
      case Token.disc.Interface:
      case Token.disc.Library:
        program.push(parseContractDefinition(context));
        break;

      case Token.disc.Function:
      case Token.disc.Constructor:
      case Token.disc.Receive:
      case Token.disc.Fallback:
        program.push(parseFunctionDefinition(context));
        break;

      case Token.disc.Event:
        program.push(parseEventDefinition(context));
        break;

      case Token.disc.Error:
        program.push(parseErrorDefinition(context));
        break;

      case Token.disc.Pragma:
        program.push(parsePragmentDirective(context));
        break;

      default:
        throw new UnexpectTokenError({ source: context.source, token: peek(context)! });
    }
  }
};

// helpers

/** Expect `token` or throw error.  */
const expect = (context: ParseContext, token: Token.disc) => {
  const next = context.tokens[context.tokenIndex++];
  if (next?.token !== token) {
    throw new ExpectTokenError({
      source: context.source,
      expected: token,
      received: next,
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

const toLoc = (
  context: ParseContext,
  start: ParseContext["tokenIndex"],
  end: ParseContext["tokenIndex"],
): SourceLocation => {
  return {
    start: context.tokens[start]!.loc.start,
    end: context.tokens[end - 1]!.loc.end,
  };
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
  const start = context.tokenIndex;
  const kind = peek(context) as Ast.FunctionDefinition["kind"];

  let hasName = false;

  if (eat(context, Token.disc.Function)) {
    hasName = true;
  } else if (
    eat(context, Token.disc.Constructor) === false &&
    eat(context, Token.disc.Fallback) === false &&
    eat(context, Token.disc.Receive) === false
  ) {
    throw new UnexpectTokenError({ source: context.source, token: kind });
  }

  let name: Token.Identifier | undefined;

  if (hasName) {
    name = peek(context) as Token.Identifier;
    expect(context, Token.disc.Identifier);
  }

  const parameters = parseList(
    context,
    Token.disc.OpenParenthesis,
    Token.disc.CloseParenthesis,
    parseParameter,
  );

  let visibility: Ast.Visibility | undefined;
  let mutability: Ast.Mutability | undefined;

  let token = peek(context) as Ast.Visibility | Ast.Mutability;

  while (true) {
    if (
      eat(context, Token.disc.External) ||
      eat(context, Token.disc.Public) ||
      eat(context, Token.disc.Internal) ||
      eat(context, Token.disc.Private)
    ) {
      visibility = token as Ast.Visibility;
      token = peek(context) as Ast.Visibility | Ast.Mutability;
    } else if (
      eat(context, Token.disc.Pure) ||
      eat(context, Token.disc.View) ||
      eat(context, Token.disc.Payable) ||
      eat(context, Token.disc.Nonpayable)
    ) {
      mutability = token as Ast.Mutability;
      token = peek(context) as Ast.Visibility | Ast.Mutability;
    } else break;
  }

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
      loc: toLoc(context, start, context.tokenIndex),
      kind,
      visibility,
      mutability,
      modifiers: [],
      parameters,
      returns,
      name,
      body,
    };
  }

  return {
    ast: Ast.disc.FunctionDefinition,
    loc: toLoc(context, start, context.tokenIndex),
    kind,
    visibility,
    mutability,
    modifiers: [],
    parameters,
    returns: [],
    name,
    body: parseBlockStatement(context),
  };
};

export const parseContractDefinition = (context: ParseContext): Ast.ContractDefinition => {
  const start = context.tokenIndex;

  eat(context, Token.disc.Abstract);
  const kind = next(context) as Ast.ContractDefinition["kind"];

  if (
    kind.token !== Token.disc.Contract &&
    kind.token !== Token.disc.Interface &&
    kind.token !== Token.disc.Library
  ) {
    throw new UnexpectTokenError({ source: context.source, token: kind as Token.Token });
  }

  const name = peek(context) as Token.Identifier;
  expect(context, Token.disc.Identifier);

  expect(context, Token.disc.OpenCurlyBrace);

  const nodes: Ast.ContractDefinition["nodes"] = [];
  while (true) {
    if (eat(context, Token.disc.CloseCurlyBrace)) {
      return {
        ast: Ast.disc.ContractDefinition,
        loc: toLoc(context, start, context.tokenIndex),
        kind,
        name,
        nodes,
      };
    }

    switch (peek(context)?.token) {
      case Token.disc.Function:
      case Token.disc.Constructor:
      case Token.disc.Receive:
      case Token.disc.Fallback:
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
        break;

      case undefined:
        throw new EOFError();

      default:
        throw new UnexpectTokenError({ source: context.source, token: peek(context)! });
    }
  }
};

export const parseEventDefinition = (context: ParseContext): Ast.EventDefinition => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Event);

  const name = peek(context) as Token.Identifier;
  expect(context, Token.disc.Identifier);

  const parameters = parseList(
    context,
    Token.disc.OpenParenthesis,
    Token.disc.CloseParenthesis,
    parseParameter,
  );

  expect(context, Token.disc.Semicolon);

  return {
    ast: Ast.disc.EventDefinition,
    loc: toLoc(context, start, context.tokenIndex),
    name,
    parameters,
  };
};

export const parseErrorDefinition = (context: ParseContext): Ast.ErrorDefinition => {
  const start = context.tokenIndex;
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

  return {
    ast: Ast.disc.ErrorDefinition,
    loc: toLoc(context, start, context.tokenIndex),
    name,
    parameters,
  };
};

export const parseStructDefinition = (context: ParseContext): Ast.StructDefinition => {
  throw new NotImplementedError({
    source: context.source,
    loc: context.tokens[context.tokenIndex]!.loc,
    feature: "structs",
  });
};

export const parseModifierDefinition = (context: ParseContext): Ast.ModifierDefinition => {
  throw new NotImplementedError({
    source: context.source,
    loc: context.tokens[context.tokenIndex]!.loc,
    feature: "modifier",
  });
};

export const parseVariableDefinition = (context: ParseContext): Ast.VariableDefintion => {
  const start = context.tokenIndex;
  const type = parseType(context);

  let isConstant = false;
  let isImmutable = false;
  let visibility: Ast.VariableDefintion["visibility"];
  let token = peek(context);

  while (true) {
    if (eat(context, Token.disc.Immutable)) {
      isImmutable = true;
      token = peek(context);
    } else if (eat(context, Token.disc.Constant)) {
      isConstant = true;
      token = peek(context);
    } else if (
      eat(context, Token.disc.External) ||
      eat(context, Token.disc.Public) ||
      eat(context, Token.disc.Internal) ||
      eat(context, Token.disc.Private)
    ) {
      visibility = token as Ast.VariableDefintion["visibility"];
      token = peek(context);
    } else break;
  }

  const identifier = peek(context) as Token.Identifier;
  expect(context, Token.disc.Identifier);

  let initializer: Ast.Expression | undefined;

  if (eat(context, Token.disc.Assign)) {
    initializer = parseExpression(context);
  }

  expect(context, Token.disc.Semicolon);

  return {
    ast: Ast.disc.VariableDefinition,
    loc: toLoc(context, start, context.tokenIndex),
    type,
    identifier,
    isConstant,
    isImmutable,
    visibility,
    initializer,
  };
};

export const parseVariableDeclaration = (context: ParseContext): Ast.VariableDeclaration => {
  const start = context.tokenIndex;

  const parseDeclaration = (context: ParseContext) => {
    if (
      peek(context)?.token === Token.disc.Comma ||
      peek(context)?.token === Token.disc.CloseParenthesis
    )
      return undefined;

    const type = parseType(context);

    let location = peek(context) as Token.Storage | Token.Memory | Token.Calldata | undefined;
    if (
      eat(context, Token.disc.Storage) === false &&
      eat(context, Token.disc.Memory) === false &&
      eat(context, Token.disc.Calldata) === false
    ) {
      location = undefined;
    }

    let identifier = peek(context) as Token.Identifier | undefined;

    if (eat(context, Token.disc.Identifier) === false) {
      identifier = undefined;
    }

    return {
      type,
      identifier,
      location,
    };
  };

  let declarations: Ast.VariableDeclaration["declarations"];

  if (peek(context)?.token === Token.disc.OpenParenthesis) {
    declarations = parseList(
      context,
      Token.disc.OpenParenthesis,
      Token.disc.CloseParenthesis,
      parseDeclaration,
    );
  } else {
    declarations = [parseDeclaration(context)];
  }

  let initializer: Ast.Expression | undefined;

  if (eat(context, Token.disc.Assign)) {
    initializer = parseExpression(context);
  }

  expect(context, Token.disc.Semicolon);

  return {
    ast: Ast.disc.VariableDeclaration,
    loc: toLoc(context, start, context.tokenIndex),
    declarations,
    initializer,
  };
};

export const parseParameter = (context: ParseContext): Ast.Parameter => {
  const start = context.tokenIndex;
  const type = parseType(context);

  let location: Ast.Parameter["location"];
  let isIndexed = false;
  const token = peek(context);

  if (
    eat(context, Token.disc.Storage) ||
    eat(context, Token.disc.Memory) ||
    eat(context, Token.disc.Calldata)
  ) {
    location = token as Ast.Parameter["location"];
  } else if (eat(context, Token.disc.Indexed)) {
    isIndexed = true;
  }

  const identifier = peek(context) as Token.Identifier;

  return {
    ast: Ast.disc.Parameter,
    loc: toLoc(context, start, context.tokenIndex),
    type,
    identifier: eat(context, Token.disc.Identifier) ? identifier : undefined,
    location,
    isIndexed,
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
    case Token.disc.Bool:
    case Token.disc.OpenParenthesis: {
      const index = context.tokenIndex;
      try {
        return parseExpressionStatement(context);
      } catch {
        context.tokenIndex = index;
        return parseVariableDeclaration(context);
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

    case Token.disc.Placeholder: {
      return parsePlaceholderStatement(context);
    }

    case undefined:
      throw new EOFError();

    default: {
      const index = context.tokenIndex;
      try {
        return parseExpressionStatement(context);
      } catch {
        context.tokenIndex = index;
        return parseVariableDeclaration(context);
      }
    }
  }
};

export const parseExpressionStatement = (context: ParseContext): Ast.ExpressionStatement => {
  const start = context.tokenIndex;
  const expression = parseExpression(context);
  expect(context, Token.disc.Semicolon);
  return {
    ast: Ast.disc.ExpressionStatement,
    loc: toLoc(context, start, context.tokenIndex),
    expression,
  };
};

export const parseBlockStatement = (context: ParseContext): Ast.BlockStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.OpenCurlyBrace);

  const statements: Ast.Statement[] = [];
  while (true) {
    if (eat(context, Token.disc.CloseCurlyBrace)) {
      return {
        ast: Ast.disc.BlockStatement,
        loc: toLoc(context, start, context.tokenIndex),
        statements,
      };
    }
    statements.push(parseStatement(context));
  }
};

export const parseUncheckedBlockStatement = (
  context: ParseContext,
): Ast.UncheckedBlockStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Unchecked);
  expect(context, Token.disc.OpenCurlyBrace);

  const statements: Ast.Statement[] = [];
  while (true) {
    if (eat(context, Token.disc.CloseCurlyBrace)) {
      return {
        ast: Ast.disc.UncheckedBlockStatement,
        loc: toLoc(context, start, context.tokenIndex),
        statements,
      };
    }
    statements.push(parseStatement(context));
  }
};

export const parseIfStatement = (context: ParseContext): Ast.IfStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.If);

  const condition = parseExpression(context);
  const trueBody = parseStatement(context);

  let falseBody: Ast.Statement | undefined;

  if (eat(context, Token.disc.Else)) {
    falseBody = parseStatement(context);
  }

  return {
    ast: Ast.disc.IfStatement,
    loc: toLoc(context, start, context.tokenIndex),
    condition,
    trueBody,
    falseBody,
  };
};

export const parseForStatement = (context: ParseContext): Ast.ForStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.For);
  expect(context, Token.disc.OpenParenthesis);

  let init: Ast.ForStatement["init"];
  let test: Ast.ForStatement["test"];
  let update: Ast.ForStatement["update"];

  if (eat(context, Token.disc.Semicolon) === false) {
    init = parseExpression(context);
    expect(context, Token.disc.Semicolon);
  }

  if (eat(context, Token.disc.Semicolon) === false) {
    test = parseExpression(context);
    expect(context, Token.disc.Semicolon);
  }

  if (eat(context, Token.disc.CloseParenthesis) === false) {
    update = parseExpression(context);
    expect(context, Token.disc.CloseParenthesis);
  }

  const body = parseStatement(context);

  return {
    ast: Ast.disc.ForStatement,
    loc: toLoc(context, start, context.tokenIndex),
    init,
    test,
    update,
    body,
  };
};

export const parseWhileStatement = (context: ParseContext): Ast.WhileStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.While);
  expect(context, Token.disc.OpenParenthesis);
  const test = parseExpression(context);
  expect(context, Token.disc.CloseParenthesis);
  const body = parseStatement(context);

  return {
    ast: Ast.disc.WhileStatement,
    loc: toLoc(context, start, context.tokenIndex),
    test,
    body,
  };
};

export const parseDoWhileStatement = (context: ParseContext): Ast.DoWhileStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Do);
  const body = parseStatement(context);
  expect(context, Token.disc.While);
  expect(context, Token.disc.OpenParenthesis);
  const test = parseExpression(context);
  expect(context, Token.disc.CloseParenthesis);
  expect(context, Token.disc.Semicolon);

  return {
    ast: Ast.disc.DoWhileStatement,
    loc: toLoc(context, start, context.tokenIndex),
    test,
    body,
  };
};

export const parseBreakStatement = (context: ParseContext): Ast.BreakStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Break);
  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.BreakStatement, loc: toLoc(context, start, context.tokenIndex) };
};

export const parseContinueStatement = (context: ParseContext): Ast.ContinueStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Continue);
  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.ContinueStatement, loc: toLoc(context, start, context.tokenIndex) };
};

export const parseEmitStatement = (context: ParseContext): Ast.EmitStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Emit);

  const event = parseExpression(context);
  if (event.ast !== Ast.disc.FunctionCallExpression) {
    throw new UnexpectExpressionError({
      source: context.source,
      expression: event,
      expected: "event",
    });
  }

  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.EmitStatement, loc: toLoc(context, start, context.tokenIndex), event };
};

export const parseRevertStatement = (context: ParseContext): Ast.RevertStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Revert);

  const error = parseExpression(context);
  if (error.ast !== Ast.disc.FunctionCallExpression) {
    throw new UnexpectExpressionError({
      source: context.source,
      expression: error,
      expected: "error",
    });
  }

  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.RevertStatement, loc: toLoc(context, start, context.tokenIndex), error };
};

export const parseReturnStatement = (context: ParseContext): Ast.ReturnStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Return);

  if (eat(context, Token.disc.Semicolon)) {
    return {
      ast: Ast.disc.ReturnStatement,
      loc: toLoc(context, start, context.tokenIndex),
      expression: undefined,
    };
  }

  const expression = parseExpression(context);
  expect(context, Token.disc.Semicolon);

  return {
    ast: Ast.disc.ReturnStatement,
    loc: toLoc(context, start, context.tokenIndex),
    expression,
  };
};

export const parsePlaceholderStatement = (context: ParseContext): Ast.PlaceholderStatement => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Placeholder);
  expect(context, Token.disc.Semicolon);

  return { ast: Ast.disc.PlaceholderStatement, loc: toLoc(context, start, context.tokenIndex) };
};

// binding power for operator associativity and precendence
// https://docs.soliditylang.org/en/v0.8.26/cheatsheet.html#order-of-precedence-of-operators

const getPrefixBindingPower = (operator: Token.Token): number | undefined => {
  switch (operator.token) {
    case Token.disc.Increment:
    case Token.disc.Decrement:
    case Token.disc.Subtract:
    case Token.disc.Delete:
    case Token.disc.Not:
    case Token.disc.BitwiseNot:
      return 27;

    default:
      return undefined;
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
  const start = context.tokenIndex;
  const token = next(context);

  let left: Ast.Expression | undefined;
  switch (token.token) {
    case Token.disc.StringLiteral:
    case Token.disc.HexLiteral:
    case Token.disc.NumberLiteral:
    case Token.disc.HexNumberLiteral:
    case Token.disc.BoolLiteral:
      left = {
        ast: Ast.disc.Literal,
        loc: token.loc,
        token,
      } satisfies Ast.Literal;
      break;

    case Token.disc.Identifier:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token,
      } satisfies Ast.Identifier;
      break;

    // type conversion
    case Token.disc.Address:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: "address",
        },
      } satisfies Ast.Identifier;
      break;

    case Token.disc.String:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: "string",
        },
      } satisfies Ast.Identifier;
      break;

    case Token.disc.Uint:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: `uint${token.size}`,
        },
      } satisfies Ast.Identifier;
      break;

    case Token.disc.Int:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: `int${token.size}`,
        },
      } satisfies Ast.Identifier;
      break;

    case Token.disc.Byte:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: `bytes${token.size}`,
        },
      } satisfies Ast.Identifier;
      break;

    case Token.disc.Bytes:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: "bytes",
        },
      } satisfies Ast.Identifier;
      break;

    case Token.disc.Bool:
      left = {
        ast: Ast.disc.Identifier,
        loc: token.loc,
        token: {
          token: Token.disc.Identifier,
          loc: token.loc,
          value: "bool",
        },
      } satisfies Ast.Identifier;
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
        if (rBp === undefined) throw new UnexpectTokenError({ source: context.source, token });

        const right = parseExpression(context, rBp);

        left = {
          ast: Ast.disc.UnaryOperation,
          loc: toLoc(context, start, context.tokenIndex),
          operator: token,
          expression: right,
          prefix: true,
        } satisfies Ast.UnaryOperation;
      }
      break;

    case Token.disc.OpenParenthesis: {
      const elements: (Ast.Expression | undefined)[] = [];

      while (true) {
        if (eat(context, Token.disc.Comma)) {
          elements.push(undefined);
          if (eat(context, Token.disc.CloseParenthesis)) break;
          continue;
        }

        elements.push(parseExpression(context));

        if (eat(context, Token.disc.CloseParenthesis)) break;
        expect(context, Token.disc.Comma);

        if (eat(context, Token.disc.CloseParenthesis)) {
          elements.push(undefined);
          break;
        }
      }
      left = {
        ast: Ast.disc.TupleExpression,
        loc: toLoc(context, start, context.tokenIndex),
        elements,
      };
      break;
    }

    case Token.disc.New:
      left = {
        ast: Ast.disc.NewExpression,
        loc: toLoc(context, start, context.tokenIndex),
        expression: parseExpression(context),
      } satisfies Ast.NewExpression;
      break;
  }

  if (left === undefined) throw new UnexpectTokenError({ source: context.source, token });

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
        if (eat(context, Token.disc.Colon)) {
          const endExpresssion = parseExpression(context, 0);
          expect(context, Token.disc.CloseBracket);
          left = {
            ast: Ast.disc.IndexRangeAccessExpression,
            loc: toLoc(context, start, context.tokenIndex),
            base: left,
            start: undefined,
            end: endExpresssion,
          };
        } else {
          const right = parseExpression(context, 0);
          if (eat(context, Token.disc.Colon)) {
            const endExpresssion = parseExpression(context, 0);
            expect(context, Token.disc.CloseBracket);
            left = {
              ast: Ast.disc.IndexRangeAccessExpression,
              loc: toLoc(context, start, context.tokenIndex),
              base: left,
              start: right,
              end: endExpresssion,
            };
          } else {
            expect(context, Token.disc.CloseBracket);
            left = {
              ast: Ast.disc.IndexAccessExpression,
              loc: toLoc(context, start, context.tokenIndex),
              base: left,
              index: right,
            };
          }
        }
      } else if (operator.token === Token.disc.OpenParenthesis) {
        context.tokenIndex--;
        const right = parseList(
          context,
          Token.disc.OpenParenthesis,
          Token.disc.CloseParenthesis,
          parseExpression,
        );
        left = {
          ast: Ast.disc.FunctionCallExpression,
          loc: toLoc(context, start, context.tokenIndex),
          expression: left,
          arguments: right,
        };
      } else {
        left = {
          ast: Ast.disc.UnaryOperation,
          loc: toLoc(context, start, context.tokenIndex),
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
        loc: toLoc(context, start, context.tokenIndex),
        condition: left,
        trueExpression: middle,
        falseExpression: right,
      } satisfies Ast.ConditionalExpression;
    } else {
      const right = parseExpression(context, infixBindingPower[1]);

      switch (operator.token) {
        case Token.disc.Member:
          if (right.ast !== Ast.disc.Identifier) {
            throw new UnexpectExpressionError({
              source: context.source,
              expression: right,
              expected: "identifier",
            });
          }

          left = {
            ast: Ast.disc.MemberAccessExpression,
            loc: toLoc(context, start, context.tokenIndex),
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
            loc: toLoc(context, start, context.tokenIndex),
            operator,
            left,
            right,
          } satisfies Ast.Assignment;
          break;

        default:
          left = {
            ast: Ast.disc.BinaryOperation,
            loc: toLoc(context, start, context.tokenIndex),
            operator: operator as Ast.BinaryOperation["operator"],
            left,
            right,
          } satisfies Ast.BinaryOperation;
      }
    }
  }

  return left;
};

// types

export const parseType = (context: ParseContext): Ast.Type => {
  if (peek(context)?.token === Token.disc.Mapping) {
    return parseMapping(context);
  }

  const index = context.tokenIndex;
  try {
    return parseArrayType(context);
  } catch {
    context.tokenIndex = index;
    try {
      return parseElementaryType(context);
    } catch {
      context.tokenIndex = index;
      try {
        return parseUserDefinedType(context);
      } catch {
        context.tokenIndex = index;
      }
    }
  }

  throw new UnexpectTokenError({ source: context.source, token: peek(context)! });
};

export const parseElementaryType = (context: ParseContext): Ast.ElementaryType => {
  const start = context.tokenIndex;
  const token = next(context);
  switch (token?.token) {
    case Token.disc.Address:
    case Token.disc.String:
    case Token.disc.Uint:
    case Token.disc.Int:
    case Token.disc.Byte:
    case Token.disc.Bytes:
    case Token.disc.Bool:
      return {
        ast: Ast.disc.ElementaryType,
        loc: toLoc(context, start, context.tokenIndex),
        type: token,
      };

    default:
      throw new UnexpectTokenError({ source: context.source, token: token! });
  }
};

export const parseArrayType = (context: ParseContext): Ast.ArrayType => {
  const start = context.tokenIndex;
  let type = parseElementaryType(context) as Ast.Type;

  let isFirstIteration = true;
  while (true) {
    if (eat(context, Token.disc.OpenBracket)) {
      isFirstIteration = false;
      let length: Ast.ArrayType["length"];

      if (eat(context, Token.disc.CloseBracket) === false) {
        length = parseExpression(context);
        expect(context, Token.disc.CloseBracket);
      } else {
      }

      type = {
        ast: Ast.disc.ArrayType,
        loc: toLoc(context, start, context.tokenIndex),
        length,
        type,
      };
    } else {
      if (isFirstIteration) expect(context, Token.disc.CloseBracket);
      break;
    }
  }

  return type as Ast.ArrayType;
};

export const parseMapping = (context: ParseContext): Ast.Mapping => {
  const start = context.tokenIndex;
  expect(context, Token.disc.Mapping);
  expect(context, Token.disc.OpenParenthesis);

  const keyType = parseType(context);
  let keyName: Ast.Mapping["keyName"];

  if (peek(context)?.token === Token.disc.Identifier) {
    keyName = next(context) as Token.Identifier;
  }

  expect(context, Token.disc.Arrow);

  const valueType = parseType(context);
  let valueName: Ast.Mapping["valueName"];

  if (peek(context)?.token === Token.disc.Identifier) {
    valueName = next(context) as Token.Identifier;
  }

  expect(context, Token.disc.CloseParenthesis);

  return {
    ast: Ast.disc.Mapping,
    loc: toLoc(context, start, context.tokenIndex),
    keyType,
    keyName,
    valueType,
    valueName,
  };
};

export const parseUserDefinedType = (context: ParseContext): Ast.UserDefinedType => {
  const start = context.tokenIndex;
  const token = next(context);

  if (token.token === Token.disc.Identifier) {
    return {
      ast: Ast.disc.UserDefinedType,
      loc: toLoc(context, start, context.tokenIndex),
      type: token,
    };
  }

  throw new UnexpectTokenError({ source: context.source, token: token! });
};

export const parsePragmentDirective = (context: ParseContext): Ast.PragmaDirective => {
  throw new NotImplementedError({
    source: context.source,
    loc: context.tokens[context.tokenIndex]!.loc,
    feature: "pragma",
  });
};
