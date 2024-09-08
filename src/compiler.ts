import { type Abi, concat, numberToHex, padHex, size, toFunctionSelector, toHex } from "viem";
import type { TypeAnnotations } from "./checker";
import { InvariantViolationError } from "./errors/invariantViolation";
import { NotImplementedError } from "./errors/notImplemented";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import type { Type } from "./types/type";
import type { Hex } from "./types/utils";
import { getAbiFunction } from "./utils/abi";
import { Code, push } from "./utils/code";
import { never } from "./utils/never";

export type CompileBytecodeContext = {
  source: string;
  annotations: TypeAnnotations;
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
  source: string,
  program: Ast.Program,
  annotations: TypeAnnotations,
): { name: string; abi: Abi; code: Hex } => {
  const context: CompileBytecodeContext = {
    source,
    annotations,
    symbols: [new Map()],
    functions: new Map(),
    freeMemoryPointer: 0x80,
  };

  for (const defintion of program) {
    switch (defintion.ast) {
      case Ast.disc.FunctionDefinition:
        compileFunction(context, defintion);
        break;

      case Ast.disc.ContractDefinition: {
        // TODO(kyle) support interface
        const code = compileContract(context, defintion);
        return { name: defintion.name.value, code, abi: [] };
      }

      case Ast.disc.VariableDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "variable definition",
        });

      case Ast.disc.EventDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "events",
        });

      case Ast.disc.ErrorDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "errors",
        });

      case Ast.disc.StructDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "structs",
        });

      case Ast.disc.ModifierDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "modifiers",
        });

      default:
        never(defintion);
    }
  }

  throw new InvariantViolationError();
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

  throw new InvariantViolationError();
};

const compileContract = (context: CompileBytecodeContext, node: Ast.ContractDefinition): Hex => {
  for (const _node of node.nodes) {
    switch (_node.ast) {
      case Ast.disc.FunctionDefinition:
        compileFunction(context, _node);
        break;

      case Ast.disc.VariableDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "variable definition",
        });

      case Ast.disc.EventDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "events",
        });

      case Ast.disc.ErrorDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "errors",
        });

      case Ast.disc.StructDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "structs",
        });

      case Ast.disc.ModifierDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "modifiers",
        });

      default:
        never(_node);
    }
  }

  // Fallback

  let code = concat([
    push(numberToHex(0)), //   [0]
    Code.CALLDATALOAD, //      [calldata]
    push(numberToHex(224)), // [224, calldata]
    Code.SHR, //               [function_selector]
  ]);

  const fallbackSize = size(code) + 11 * context.functions.size + 1;
  let locationOffset = fallbackSize;

  for (const [functionNode, _code] of context.functions) {
    const selector = toFunctionSelector(getAbiFunction(functionNode));

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
    throw new NotImplementedError({
      source: context.source,
      loc: node.loc,
      feature: "internal functions",
    });
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
      return concat([push("0x0"), push(location), Code.MSTORE]);
    }

    case Ast.disc.ExpressionStatement: {
      return compileExpression(context, node.expression).code;
    }

    case Ast.disc.BlockStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "blocks",
      });
    }

    case Ast.disc.UncheckedBlockStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "unchecked blocks",
      });
    }

    case Ast.disc.IfStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "if statements",
      });
    }

    case Ast.disc.ForStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "for loops",
      });
    }

    case Ast.disc.WhileStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "while loops",
      });
    }

    case Ast.disc.DoWhileStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "do-while loops",
      });
    }

    case Ast.disc.BreakStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "break statement",
      });
    }

    case Ast.disc.ContinueStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "continue statement",
      });
    }

    case Ast.disc.EmitStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "emit statement",
      });
    }

    case Ast.disc.RevertStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "revert statement",
      });
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
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "placeholder",
      });
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
): { code: Hex; stack: number } => {
  switch (node.ast) {
    case Ast.disc.Identifier: {
      const { location } = resolveSymbol(context, node.token.value);
      return { code: concat([push(location), Code.MLOAD]), stack: 1 };
    }

    case Ast.disc.Literal: {
      switch (node.token.token) {
        case Token.disc.StringLiteral: {
          throw new InvariantViolationError();
        }

        case Token.disc.AddressLiteral: {
          return {
            code: push(node.token.value),
            stack: 1,
          };
        }

        case Token.disc.HexLiteral: {
          throw new InvariantViolationError();
        }

        case Token.disc.NumberLiteral: {
          return {
            code: push(toHex(node.token.value)),
            stack: 1,
          };
        }

        case Token.disc.RationalNumberLiteral: {
          throw new InvariantViolationError();
        }

        case Token.disc.HexNumberLiteral: {
          throw new InvariantViolationError();
        }

        case Token.disc.BoolLiteral: {
          throw new NotImplementedError({ source: "" });
        }

        default:
          never(node.token);
          throw new InvariantViolationError();
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
        return { ...compileExpression(context, node.arguments[0]!) };
      }

      // TODO(kyle) fix overfitting
      if (node.expression.ast === Ast.disc.MemberAccessExpression) {
        const expression = compileExpression(context, node.expression.expression);
        const functionType = context.annotations.get(node)! as Type.Function;

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
          push(numberToHex(functionType.parameters.length * 0x20)), //                 [arg_size, ret_offset, address]
          push(numberToHex(inputLocation)), //               [arg_offset, arg_size, ret_offset, address]
          push(numberToHex(0)), //                           [value, arg_offset, arg_size, ret_offset, address]
          push(numberToHex(functionType.returns.length * 0x20)), // [ret_size, value, arg_offset, arg_size, ret_offset, address]
          Code.SWAP5, //                                     [address, value, arg_offset, arg_size, ret_offset, ret_size]
          Code.GAS, //                                       [gas, address, value, arg_offset, arg_size, ret_offset, ret_size]
          Code.CALL, //                                      [success]
          Code.POP, //                                       []
        ]);

        let _return: Hex = "0x";
        for (let i = 0; i < functionType.returns.length; i++) {
          _return = concat([
            _return,
            push(
              numberToHex(
                context.freeMemoryPointer + functionType.returns.length * 0x20 - (i + 1) * 0x20,
              ),
            ),
            Code.MLOAD,
          ]);
        }

        context.freeMemoryPointer = inputLocation;

        return {
          code: concat([input, call, _return]),
          stack: functionType.returns.length,
        };
      }

      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.MemberAccessExpression: {
      throw new NotImplementedError({ source: "" });
    }

    case Ast.disc.IndexAccessExpression: {
      throw new InvariantViolationError();
    }

    case Ast.disc.NewExpression: {
      throw new InvariantViolationError();
    }

    case Ast.disc.TupleExpression: {
      throw new InvariantViolationError();
    }
  }
};
