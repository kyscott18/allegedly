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

  const maybeEvent = tryParseExpression(context);
  if (maybeEvent?.ast !== Ast.AstType.FunctionCallExpression) {
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
    event: maybeEvent,
  };
};

export const tryParseRevertStatement = (context: ParseContext): Ast.RevertStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeRevert = context.tokens[context.tokenIndex++];

  if (maybeRevert?.token !== Token.TokenType.Revert) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const maybeError = tryParseExpression(context);
  if (maybeError?.ast !== Ast.AstType.FunctionCallExpression) {
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
    error: maybeError,
  };
};

export const tryParseReturnStatement = (context: ParseContext): Ast.ReturnStatement | undefined => {
  const startIndex = context.tokenIndex;

  const maybeReturn = context.tokens[context.tokenIndex++];

  if (maybeReturn?.token !== Token.TokenType.Return) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (context.tokens[context.tokenIndex]?.token === Token.TokenType.Semicolon) {
    context.tokenIndex++;

    return {
      ast: Ast.AstType.ReturnStatement,
      expression: undefined,
    };
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

export function tryParseExpression(context: ParseContext, minBp = 0): Ast.Expression | undefined {
  const left = _tryParseExpression(context, minBp);
  if (left === undefined) return undefined;

  const functionCall = tryParseFunctionCallExpression(context, left);

  if (functionCall === undefined) return left;
  return functionCall;
}

function _tryParseExpression(context: ParseContext, minBp: number): Ast.Expression | undefined {
  const startIndex = context.tokenIndex;
  const token = context.tokens[context.tokenIndex++];

  if (token === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

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

        const right = tryParseExpression(context, rBp);
        if (right === undefined) {
          context.tokenIndex = startIndex;
          return undefined;
        }

        left = {
          ast: Ast.AstType.UnaryOperation,
          operator: token,
          expression: right,
          prefix: true,
        } satisfies Ast.UnaryOperation;
      }
      break;

    case Token.TokenType.OpenParenthesis:
      left = tryParseExpression(context, 0);
      if (left === undefined) {
        context.tokenIndex = startIndex;
        return undefined;
      }

      if (context.tokens[context.tokenIndex]?.token === Token.TokenType.Comma) {
        const tuple = tryParseTupleExpression(context, left);
        if (tuple === undefined) {
          context.tokenIndex = startIndex;
          return undefined;
        }
        left = tuple;
        break;
      }

      if (context.tokens[context.tokenIndex++]?.token === Token.TokenType.CloseParenthesis) {
        break;
      }

      context.tokenIndex = startIndex;
      return undefined;

    case Token.TokenType.New:
      {
        const right = tryParseExpression(context);
        if (right === undefined) {
          context.tokenIndex = startIndex;
          return undefined;
        }

        left = {
          ast: Ast.AstType.NewExpression,
          expression: right,
        } satisfies Ast.NewExpression;
      }
      break;

    default:
      context.tokenIndex = startIndex;
      return undefined;
  }

  while (true) {
    const operator = context.tokens[context.tokenIndex];

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

      context.tokenIndex++;

      if (operator.token === Token.TokenType.OpenBracket) {
        const right = tryParseExpression(context, 0);
        if (
          right === undefined ||
          context.tokens[context.tokenIndex++]?.token !== Token.TokenType.CloseBracket
        ) {
          context.tokenIndex = startIndex;
          return undefined;
        }

        left = { ast: Ast.AstType.IndexAccessExpression, base: left!, index: right };
      } else {
        left = {
          ast: Ast.AstType.UnaryOperation,
          operator: operator as Token.Increment | Token.Decrement,
          expression: left!,
          prefix: false,
        } satisfies Ast.UnaryOperation;
      }

      continue;
    }

    const infixBindingPower = getInfixBindingPower(operator);
    if (infixBindingPower === undefined) break;

    if (infixBindingPower[0] < minBp) break;

    context.tokenIndex++;

    if (operator.token === Token.TokenType.Question) {
      const middle = tryParseExpression(context, 0);
      if (
        middle === undefined ||
        context.tokens[context.tokenIndex++]?.token !== Token.TokenType.Colon
      ) {
        context.tokenIndex = startIndex;
        return undefined;
      }
      const right = tryParseExpression(context, infixBindingPower[1]);
      if (right === undefined) {
        context.tokenIndex = startIndex;
        return undefined;
      }

      left = {
        ast: Ast.AstType.ConditionalExpression,
        condition: left!,
        trueExpression: middle,
        falseExpression: right,
      } satisfies Ast.ConditionalExpression;
    } else {
      const right = tryParseExpression(context, infixBindingPower[1]);
      if (right === undefined) {
        context.tokenIndex = startIndex;
        return undefined;
      }

      switch (operator.token) {
        case Token.TokenType.Member:
          if (right.ast !== Ast.AstType.Identifier) {
            context.tokenIndex = startIndex;
            return undefined;
          }

          left = {
            ast: Ast.AstType.MemberAccessExpression,
            expression: left!,
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
            operator: operator,
            left: left!,
            right,
          } satisfies Ast.Assignment;
          break;

        default:
          left = {
            ast: Ast.AstType.BinaryOperation,
            operator: operator as Ast.BinaryOperation["operator"],
            left: left!,
            right,
          } satisfies Ast.BinaryOperation;
      }
    }
  }

  return left;
}

function tryParseTupleExpression(
  context: ParseContext,
  firstExpression: Ast.Expression,
): Ast.TupleExpression | undefined {
  const startIndex = context.tokenIndex;

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

    const element = tryParseExpression(context);

    if (element === undefined) {
      context.tokenIndex = startIndex;
      return undefined;
    }

    elements.push(element);

    // TODO(kyle) maybe missing expression: continue;
  }

  return { ast: Ast.AstType.TupleExpression, elements };
}

function tryParseFunctionCallExpression(
  context: ParseContext,
  expression: Ast.Expression,
): Ast.FunctionCallExpression | undefined {
  const startIndex = context.tokenIndex;

  if (context.tokens[context.tokenIndex++]?.token !== Token.TokenType.OpenParenthesis) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  if (context.tokens[context.tokenIndex]?.token === Token.TokenType.CloseParenthesis) {
    context.tokenIndex++;
    return { ast: Ast.AstType.FunctionCallExpression, expression, arguments: [] };
  }

  const first = tryParseExpression(context);
  if (first === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  const _arguments = tryParseTupleExpression(context, first);
  if (_arguments === undefined) {
    context.tokenIndex = startIndex;
    return undefined;
  }

  // TODO(kyle) check for close parens

  return { ast: Ast.AstType.FunctionCallExpression, expression, arguments: _arguments.elements };
}

// export function* tryParseVariableDeclaration(
//   context: ParseContext,
// ): Generator<Ast.VariableDeclaration> {
//   const startIndex = context.tokenIndex;

//   const type = tryParseType(context);
//   if (type === undefined) {
//     context.tokenIndex = startIndex;
//     return;
//   }

//   let maybeLocation = context.tokens[context.tokenIndex++];

//   if (
//     maybeLocation?.token !== Token.TokenType.Storage &&
//     maybeLocation?.token !== Token.TokenType.Memory &&
//     maybeLocation?.token !== Token.TokenType.Calldata
//   ) {
//     context.tokenIndex--;
//     maybeLocation = undefined;
//   }

//   const identifiers = tryParseIdentifier(context);
//   for (const identifier of identifiers) {
//     const maybeAssign = context.tokens[context.tokenIndex++];

//     if (maybeAssign?.token !== Token.TokenType.Assign) {
//       context.tokenIndex--;
//       yield {
//         ast: Ast.AstType.VariableDeclaration,
//         type,
//         location: maybeLocation,
//         attributes: [],
//         identifier: identifier.token,
//         initializer: undefined,
//       };
//       continue;
//     }

//     const initializers = tryParseExpression(context);
//     for (const initializer of initializers) {
//       yield {
//         ast: Ast.AstType.VariableDeclaration,
//         type,
//         location: maybeLocation,
//         attributes: [],
//         identifier: identifier.token,
//         initializer,
//       };
//     }
//   }
// }

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
