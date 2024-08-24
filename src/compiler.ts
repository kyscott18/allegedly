import { concat, numberToHex, padHex, size, toFunctionSelector, toHex } from "viem";
import { compileFunctionAbi } from "./abiCompiler";
import { NotImplementedError } from "./errors/notImplemented";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import type { Hex } from "./types/utils";
import { Code, push } from "./utils/code";
import { never } from "./utils/never";

export type CompileBytecodeContext = {
  symbols: Map<
    string,
    {
      /** Memory location for identifiers */
      location: Hex;
    }
  >[];
  functions: Map<Ast.FunctionDefinition, Hex>;
  freeMemoryPointer: number;
};

/**
 * Compiles a valid Solidity program represented by an abstract
 * syntax tree into EVM bytecode.
 */
export const compile = (program: Ast.Program): Hex => {
  const context: CompileBytecodeContext = {
    symbols: [new Map()],
    functions: new Map(),
    freeMemoryPointer: 0x80,
  };

  for (const defintion of program) {
    switch (defintion.ast) {
      case Ast.AstType.FunctionDefinition:
        compileFunction(context, defintion);
        break;

      case Ast.AstType.ContractDefinition:
        return compileContract(context, defintion);

      case Ast.AstType.EventDefinition:
      case Ast.AstType.ErrorDefinition:
      case Ast.AstType.StructDefinition:
      case Ast.AstType.ModifierDefinition:
        break;

      default:
        never(defintion);
    }
  }
  throw "unreachable";
};

const enterScope = (context: CompileBytecodeContext) => {
  context.symbols.push(new Map());
};

const exitScope = (context: CompileBytecodeContext) => {
  context.symbols.pop();
};

const addSymbol = (context: CompileBytecodeContext, symbol: string): Hex => {
  const scope = context.symbols[context.symbols.length - 1]!;
  const location = numberToHex(context.freeMemoryPointer);

  scope.set(symbol, { location: numberToHex(context.freeMemoryPointer) });
  context.freeMemoryPointer += 0x20;

  return location;
};

const resolveSymbol = (context: CompileBytecodeContext, symbol: string): Hex => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    if (scope?.has(symbol)) return scope.get(symbol)!.location;
  }

  throw "unreachable";
};

const compileContract = (context: CompileBytecodeContext, node: Ast.ContractDefinition): Hex => {
  for (const _node of node.nodes) {
    switch (_node.ast) {
      case Ast.AstType.FunctionDefinition:
        compileFunction(context, _node);
        break;

      case Ast.AstType.VariableDefinition:
      case Ast.AstType.EventDefinition:
      case Ast.AstType.ErrorDefinition:
      case Ast.AstType.StructDefinition:
      case Ast.AstType.ModifierDefinition:
        throw new NotImplementedError({ source: JSON.stringify(_node, null, 2) });

      default:
        never(_node);
    }
  }

  // Fallback

  let code = concat([
    push(numberToHex(0)), //    [0]
    Code.CALLDATALOAD, //       [calldata]
    push(numberToHex(224)), //  [224, calldata]
    Code.SHR, //                [function_selector]
  ]);

  const fallbackSize = size(code) + 11 * context.functions.size + 1;
  let locationOffset = fallbackSize;

  for (const [functionNode, _code] of context.functions) {
    const selector = toFunctionSelector(compileFunctionAbi({}, functionNode));

    // Determine the location of the function implementation
    // Note: `location` sized is padded to 2 bytes (max program size is < 2 bytes)
    const location = padHex(numberToHex(locationOffset), { size: 2 });

    code = concat([
      code, //           [function_selector]
      Code.DUP1, //      [function_selector, function_selector]
      push(selector), // [input_function_selector, function_selector, function_selector]
      Code.EQ, //        [is_function_matched, function_selector]
      push(location), // [function_location, is_function_matched, function_selector]
      Code.JUMPI, //     [function_selector]
    ]);

    locationOffset += 3 + size(_code);
  }

  // INVALID if no matched selectors
  code = concat([code, Code.INVALID]);

  for (const [, _code] of context.functions) {
    code = concat([code, Code.JUMPDEST, Code.POP, _code, Code.STOP]);
  }

  return code;
};

const compileFunction = (context: CompileBytecodeContext, node: Ast.FunctionDefinition) => {
  enterScope(context);

  let code: Hex = "0x";

  // TODO(kyle) validate input

  let inputOffset = 0x04;
  for (const parameter of node.parameters) {
    if (parameter.identifier === undefined) continue;
    const location = addSymbol(context, parameter.identifier.value);
    code = concat([
      push(numberToHex(0x20)),
      push(numberToHex(inputOffset)),
      push(location),
      Code.CALLDATACOPY,
    ]);
    inputOffset += 0x20;
  }

  for (const statement of node.body.statements) {
    code = concat([code, compileStatement(context, statement)]);
  }

  if (
    node.visibility.token === Token.TokenType.External ||
    node.visibility.token === Token.TokenType.Public
  ) {
    context.functions.set(node, code);
  } else {
    // TODO(kyle) not implemented
  }

  exitScope(context);
};

const compileStatement = (context: CompileBytecodeContext, node: Ast.Statement): Hex => {
  switch (node.ast) {
    case Ast.AstType.VariableDeclaration: {
      const location = addSymbol(context, node.identifier.value);
      if (node.initializer) {
        return concat([compileExpression(context, node.initializer), push(location), Code.MSTORE]);
      }
      return "0x";
    }

    case Ast.AstType.ExpressionStatement: {
      return compileExpression(context, node.expression);
    }

    case Ast.AstType.BlockStatement: {
      return "0x";
    }

    case Ast.AstType.UncheckedBlockStatement: {
      return "0x";
    }

    case Ast.AstType.IfStatement: {
      return "0x";
    }

    case Ast.AstType.ForStatement: {
      return "0x";
    }

    case Ast.AstType.WhileStatement: {
      return "0x";
    }

    case Ast.AstType.DoWhileStatement: {
      return "0x";
    }

    case Ast.AstType.BreakStatement: {
      return "0x";
    }

    case Ast.AstType.ContinueStatement: {
      return "0x";
    }

    case Ast.AstType.EmitStatement: {
      return "0x";
    }

    case Ast.AstType.RevertStatement: {
      return "0x";
    }

    case Ast.AstType.ReturnStatement: {
      if (node.expression === undefined) {
        return concat([push("0x0"), push("0x0"), Code.RETURN]);
      }
      const expression = compileExpression(context, node.expression);
      const location = numberToHex(context.freeMemoryPointer);

      return concat([
        expression,
        push(location),
        Code.MSTORE,
        push("0x20"),
        push(location),
        Code.RETURN,
      ]);
    }

    case Ast.AstType.PlaceholderStatement: {
      return "0x";
    }
  }
};

/**
 * The result of executing an expression is adding the result of the expression
 * to the top of the stack.
 *
 * Note: should this also return how many stack items were added?
 */
const compileExpression = (context: CompileBytecodeContext, node: Ast.Expression): Hex => {
  switch (node.ast) {
    case Ast.AstType.Identifier: {
      const location = resolveSymbol(context, node.token.value);
      return concat([push(location), Code.MLOAD]);
    }

    case Ast.AstType.Literal: {
      switch (node.token.token) {
        case Token.TokenType.StringLiteral: {
          return "0x";
        }

        case Token.TokenType.AddressLiteral: {
          return "0x";
        }

        case Token.TokenType.HexLiteral: {
          return "0x";
        }

        case Token.TokenType.NumberLiteral: {
          return push(toHex(node.token.value));
        }

        case Token.TokenType.RationalNumberLiteral: {
          return "0x";
        }

        case Token.TokenType.HexNumberLiteral: {
          return "0x";
        }

        case Token.TokenType.BoolLiteral: {
          return "0x";
        }

        default:
          never(node.token);
          throw "unreachable";
      }
    }

    case Ast.AstType.Assignment: {
      return "0x";
    }

    case Ast.AstType.UnaryOperation: {
      return "0x";
    }

    case Ast.AstType.BinaryOperation: {
      return "0x";
    }

    case Ast.AstType.ConditionalExpression: {
      return "0x";
    }

    case Ast.AstType.FunctionCallExpression: {
      return "0x";
    }

    case Ast.AstType.MemberAccessExpression: {
      return "0x";
    }

    case Ast.AstType.IndexAccessExpression: {
      return "0x";
    }

    case Ast.AstType.NewExpression: {
      return "0x";
    }

    case Ast.AstType.TupleExpression: {
      return "0x";
    }
  }
};
