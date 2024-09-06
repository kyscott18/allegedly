import { type Abi, concat, numberToHex, padHex, size, toFunctionSelector, toHex } from "viem";
import type { TypeAnnotations } from "./checker";
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
export const compile = (
  program: Ast.Program,
  annotations: TypeAnnotations,
): { name: string; abi: Abi; code: Hex } => {
  const context: CompileBytecodeContext = {
    symbols: [new Map()],
    functions: new Map(),
    freeMemoryPointer: 0x80,
  };

  for (const defintion of program) {
    switch (defintion.ast) {
      case Ast.disc.FunctionDefinition:
        compileFunction(context, defintion);
        break;

      case Ast.disc.ContractDefinition:
        return compileContract(context, defintion);

      case Ast.disc.VariableDefinition:
      case Ast.disc.EventDefinition:
      case Ast.disc.ErrorDefinition:
      case Ast.disc.StructDefinition:
      case Ast.disc.ModifierDefinition:
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

const resolveSymbol = (context: CompileBytecodeContext, symbol: string): { location: Hex } => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    if (scope?.has(symbol)) {
      return { location: scope.get(symbol)!.location };
    }
  }

  throw "unreachable";
};

const resolveSymbolType = (context: CompileBytecodeContext, symbol: string): { type: Type } => {
  for (let i = context.typeSymbols.length - 1; i >= 0; i--) {
    if (context.typeSymbols[i]?.has(symbol)) {
      const type = context.typeSymbols[i]!.get(symbol)!;
      return { type };
    }
  }

  throw "unreachable";
};

const compileContract = (context: CompileBytecodeContext, node: Ast.ContractDefinition): Hex => {
  for (const _node of node.nodes) {
    switch (_node.ast) {
      case Ast.disc.FunctionDefinition:
        compileFunction(context, _node);
        break;

      case Ast.disc.VariableDefinition:
      case Ast.disc.EventDefinition:
      case Ast.disc.ErrorDefinition:
      case Ast.disc.StructDefinition:
      case Ast.disc.ModifierDefinition:
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

  for (const statement of node.body!.statements) {
    code = concat([code, compileStatement(context, statement)]);
  }

  if (
    node.visibility.token === Token.disc.External ||
    node.visibility.token === Token.disc.Public
  ) {
    context.functions.set(node, code);
  } else {
    // TODO(kyle) not implemented
  }

  exitScope(context);
};

const compileStatement = (context: CompileBytecodeContext, node: Ast.Statement): Hex => {
  switch (node.ast) {
    case Ast.disc.VariableDeclaration: {
      const location = addSymbol(context, node.identifier.value);
      if (node.initializer) {
        return concat([
          compileExpression(context, node.initializer).code,
          push(location),
          Code.MSTORE,
        ]);
      }
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.ExpressionStatement: {
      return compileExpression(context, node.expression).code;
    }

    case Ast.disc.BlockStatement: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.UncheckedBlockStatement: {
      return "0x";
    }

    case Ast.disc.IfStatement: {
      return "0x";
    }

    case Ast.disc.ForStatement: {
      return "0x";
    }

    case Ast.disc.WhileStatement: {
      return "0x";
    }

    case Ast.disc.DoWhileStatement: {
      return "0x";
    }

    case Ast.disc.BreakStatement: {
      return "0x";
    }

    case Ast.disc.ContinueStatement: {
      return "0x";
    }

    case Ast.disc.EmitStatement: {
      return "0x";
    }

    case Ast.disc.RevertStatement: {
      return "0x";
    }

    case Ast.disc.ReturnStatement: {
      if (node.expression === undefined) {
        return concat([push("0x0"), push("0x0"), Code.RETURN]);
      }
      const expression = compileExpression(context, node.expression);
      const location = numberToHex(context.freeMemoryPointer);

      return concat([
        expression.code,
        push(location),
        Code.MSTORE,
        push("0x20"),
        push(location),
        Code.RETURN,
      ]);
    }

    case Ast.disc.PlaceholderStatement: {
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
const compileExpression = (
  context: CompileBytecodeContext,
  node: Ast.Expression,
): { code: Hex; stack: number; type: Type[] } => {
  switch (node.ast) {
    case Ast.disc.Identifier: {
      const { location } = resolveSymbol(context, node.token.value);
      const { type } = resolveSymbolType(context, node.token.value);
      return { code: concat([push(location), Code.MLOAD]), stack: 1, type: [type] };
    }

    case Ast.disc.Literal: {
      switch (node.token.token) {
        case Token.disc.StringLiteral: {
          throw new NotImplementedError({ source: "" });
        }

        case Token.disc.AddressLiteral: {
          return {
            code: push(node.token.value),
            stack: 1,
            type: [{ _type: "elementary", type: { token: Token.disc.Address }, isLiteral: true }],
          };
        }

        case Token.disc.HexLiteral: {
          throw new NotImplementedError({ source: "" });
        }

        case Token.disc.NumberLiteral: {
          return {
            code: push(toHex(node.token.value)),
            stack: 1,
            type: [
              // {
              //   _type: "elementary",
              //   type: { token: Token.TokenType.Uint },
              //   isLiteral: true,
              // },
            ],
          };
        }

        case Token.disc.RationalNumberLiteral: {
          throw new NotImplementedError({ source: "" });
        }

        case Token.disc.HexNumberLiteral: {
          throw new NotImplementedError({ source: "" });
        }

        case Token.disc.BoolLiteral: {
          throw new NotImplementedError({ source: "" });
        }

        default:
          never(node.token);
          throw "unreachable";
      }
    }

    case Ast.disc.Assignment: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.UnaryOperation: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.BinaryOperation: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.ConditionalExpression: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.FunctionCallExpression: {
      if (node.expression.ast === Ast.disc.Identifier) {
        const { type } = resolveSymbolType(context, node.expression.token.value);

        return { ...compileExpression(context, node.arguments[0]!), type: [type] };
      }

      if (node.expression.ast === Ast.disc.MemberAccessExpression) {
        const expression = compileExpression(context, node.expression.expression);
        const t = (expression.type[0]! as Extract<Type, { _type: "contract" }>).functions[0]![1];

        const inputLocation = context.freeMemoryPointer;
        let input: Hex = "0x";

        // TODO(kyle) add function selector to input

        for (let i = 0; i < node.arguments.length; i++) {
          input = concat([
            input,
            compileExpression(context, node.arguments[i]!).code,
            push(numberToHex(context.freeMemoryPointer)),
            Code.MSTORE,
          ]);

          context.freeMemoryPointer += 0x20;
        }

        const call = concat([
          expression.code, //                                [address]
          push(numberToHex(context.freeMemoryPointer)), //   [ret_offset, address]
          push(numberToHex(t.parameterTypes.length * 0x20)), //                 [arg_size, ret_offset, address]
          push(numberToHex(inputLocation)), //               [arg_offset, arg_size, ret_offset, address]
          push(numberToHex(0)), //                           [value, arg_offset, arg_size, ret_offset, address]
          push(numberToHex(t.returnTypes.length * 0x20)), // [ret_size, value, arg_offset, arg_size, ret_offset, address]
          Code.SWAP5, //                                     [address, value, arg_offset, arg_size, ret_offset, ret_size]
          Code.GAS, //                                       [gas, address, value, arg_offset, arg_size, ret_offset, ret_size]
          Code.CALL, //                                      [success]
          Code.POP, //                                       []
        ]);

        let _return: Hex = "0x";
        for (let i = 0; i < t.returnTypes.length; i++) {
          _return = concat([
            _return,
            push(
              numberToHex(context.freeMemoryPointer + t.returnTypes.length * 0x20 - (i + 1) * 0x20),
            ),
            Code.MLOAD,
          ]);
        }

        context.freeMemoryPointer = inputLocation;

        return {
          code: concat([input, call, _return]),
          stack: t.returnTypes.length,
          type: t.returnTypes,
        };
      }

      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.MemberAccessExpression: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.IndexAccessExpression: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.NewExpression: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.TupleExpression: {
      throw new NotImplementedError({ source: "" });
    }
  }
};
