import { type Abi, concat, numberToHex, padHex, size, toFunctionSelector, toHex } from "viem";
import type { TypeAnnotations } from "./checker";
import { InvariantViolationError } from "./errors/invariantViolation";
import { NotImplementedError } from "./errors/notImplemented";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import { Type } from "./types/type";
import type { Hex } from "./types/utils";
import { getAbiFunction } from "./utils/abi";
import { Code, getMask, push } from "./utils/code";
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
          feature: "event definition",
        });

      case Ast.disc.ErrorDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "error definition",
        });

      case Ast.disc.StructDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "struct definition",
        });

      case Ast.disc.ModifierDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "modifier definition",
        });

      case Ast.disc.PragmaDirective:
        throw new NotImplementedError({
          source: context.source,
          loc: defintion.loc,
          feature: "pragma directive",
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

// TODO(kyle) this could take an lvalue ast node
const resolveSymbol = (context: CompileBytecodeContext, symbol: string): { location: Hex } => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    if (scope?.has(symbol)) {
      return { location: scope.get(symbol)!.location };
    }
  }

  throw new InvariantViolationError();
};

const isSignedArithmetic = (context: CompileBytecodeContext, node: Ast.Expression) => {
  const type = context.annotations.get(node)!;

  if (type.type === Type.disc.Elementary && type.value.token === Token.disc.Int) {
    return true;
  }

  if (
    type.type === Type.disc.Elementary &&
    (type.value.token === Token.disc.Uint || type.value.token === Token.disc.Byte)
  ) {
    return false;
  }

  if (type.type === Type.disc.Literal) return false;

  throw new InvariantViolationError();
};

const getBits = (context: CompileBytecodeContext, node: Ast.BinaryOperation | Ast.Assignment) => {
  const type = context.annotations.get(node)!;

  if (
    type.type === Type.disc.Elementary &&
    (type.value.token === Token.disc.Uint || type.value.token === Token.disc.Int)
  ) {
    return type.value.size;
  }

  if (type.type === Type.disc.Elementary && type.value.token === Token.disc.Byte) {
    return type.value.size * 8;
  }

  if (type.type === Type.disc.Literal) {
    return size(compileLiteral(type.value));
  }

  throw new InvariantViolationError();
};

export const compileLiteral = (value: Omit<Ast.Literal["token"], "loc">): Hex => {
  switch (value.token) {
    case Token.disc.NumberLiteral: {
      return toHex(BigInt(value.value));
    }

    case Token.disc.HexNumberLiteral: {
      return value.value as Hex;
    }

    case Token.disc.BoolLiteral: {
      return value.value === "true" ? "0x01" : "0x00";
    }

    case Token.disc.StringLiteral:
    case Token.disc.HexLiteral:
      throw new InvariantViolationError();
  }
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
          feature: "event definition",
        });

      case Ast.disc.ErrorDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "error definition",
        });

      case Ast.disc.StructDefinition:
        throw new NotImplementedError({
          source: context.source,
          loc: _node.loc,
          feature: "struct definition",
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
    push(0), //           [0]
    Code.CALLDATALOAD, // [calldata]
    push(224), //         [224, calldata]
    Code.SHR, //          [function_selector]
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
    code = concat([push(0x20), push(inputOffset), push(location), Code.CALLDATACOPY]);
    inputOffset += 0x20;
  }

  for (const statement of node.body!.statements) {
    code = concat([code, compileStatement(context, statement)]);
  }

  if (
    node.visibility === undefined ||
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
      if (node.initializer) {
        let code = compileExpression(context, node.initializer).code;

        for (const declaration of node.declarations) {
          if (declaration?.identifier) {
            const location = addSymbol(context, declaration.identifier.value);
            code = concat([code, push(location), Code.MSTORE]);
          } else {
            concat([Code.POP]);
          }
        }
        return code;
      }

      let code: Hex = "0x";

      for (const declaration of node.declarations) {
        if (declaration?.identifier) {
          const location = addSymbol(context, declaration.identifier.value);
          code = concat([code, push(0), push(location), Code.MSTORE]);
        }
      }

      return code;
    }

    case Ast.disc.ExpressionStatement: {
      return compileExpression(context, node.expression).code;
    }

    case Ast.disc.BlockStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "block statement",
      });
    }

    case Ast.disc.UncheckedBlockStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "unchecked block statement",
      });
    }

    case Ast.disc.IfStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "if statement",
      });
    }

    case Ast.disc.ForStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "for loop statement",
      });
    }

    case Ast.disc.WhileStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "while loop statement",
      });
    }

    case Ast.disc.DoWhileStatement: {
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "do-while loop statement",
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
        feature: "placeholder statement",
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

        case Token.disc.HexLiteral: {
          throw new InvariantViolationError();
        }

        case Token.disc.HexNumberLiteral:
        case Token.disc.BoolLiteral:
        case Token.disc.NumberLiteral: {
          return {
            code: push(compileLiteral(node.token)),
            stack: 1,
          };
        }

        default:
          never(node.token);
          throw new InvariantViolationError();
      }
    }

    case Ast.disc.Assignment: {
      switch (node.operator.token) {
        case Token.disc.Assign: {
          if (node.left.ast === Ast.disc.TupleExpression) {
            const expression = compileExpression(context, node.right);

            const length = node.left.elements.length;
            let code = expression.code;

            code = concat([
              code,
              ...node.left.elements.map(() => Code[`DUP${length}` as keyof typeof Code]),
            ]);

            for (const element of node.left.elements) {
              if (element) {
                const { location } = resolveSymbol(
                  context,
                  (element as Ast.Identifier).token.value,
                );

                code = concat([code, push(location), Code.MSTORE]);
              } else {
                code = concat([code, Code.POP]);
              }
            }

            return { code, stack: expression.stack };
          }

          // type: Identifier

          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);

          // TODO(kyle) fix stack "leak"
          return {
            code: concat([
              compileExpression(context, node.right).code,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.AddAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.ADD,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.SubtractAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.SUB,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.MulAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.MUL,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.DivideAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              isSignedArithmetic(context, node) ? Code.SDIV : Code.DIV,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.ModuloAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              isSignedArithmetic(context, node) ? Code.SMOD : Code.MOD,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseAndAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.AND,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseOrAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.OR,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseXOrAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.XOR,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.ShiftLeftAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.SWAP1,
              Code.SHL,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        case Token.disc.ShiftRightAssign: {
          const { location } = resolveSymbol(context, (node.left as Ast.Identifier).token.value);
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);

          return {
            code: concat([
              compileExpression(context, node.right).code,
              push(location),
              Code.MLOAD,
              Code.SWAP1,
              Code.SHR,
              mask,
              Code.DUP1,
              push(location),
              Code.MSTORE,
            ]),
            stack: 1,
          };
        }

        default:
          never(node.operator);
          throw new InvariantViolationError();
      }
    }

    case Ast.disc.UnaryOperation: {
      const expression = compileExpression(context, node.expression);
      switch (node.operator.token) {
        case Token.disc.Subtract:
          return {
            code: concat([
              expression.code, // [value]
              Code.NOT, //         [~value]
              push(1), //          [1, ~value]
              Code.ADD, //         [~value + 1]
            ]),
            stack: 1,
          };

        case Token.disc.Increment:
        case Token.disc.Decrement: {
          // This assumes `node.expression` is an identifier lvalue
          const { location } = resolveSymbol(
            context,
            (node.expression as Ast.Identifier).token.value,
          );

          // TODO(kyle) safe math

          const op = node.operator.token === Token.disc.Increment ? Code.ADD : Code.SUB;

          if (node.prefix) {
            return {
              code: concat([
                push(1), //          [1]
                expression.code, // [value, 1]
                op, //               [value +- 1]
                Code.DUP1, //        [value +- 1, value +- 1]
                push(location), //   [location, value +- 1, value +- 1]
                Code.MSTORE, //      [value + 1]
              ]),
              stack: 1,
            };
          }

          return {
            code: concat([
              expression.code, // [value]
              push(1), //          [1, value]
              Code.DUP2, //        [value, 1, value]
              op, //               [value +- 1, value]
              push(location), //   [location, value +- 1, value]
              Code.MSTORE, //      [value]
            ]),
            stack: 1,
          };
        }

        case Token.disc.Delete: {
          // This assumes `node.expression` is an identifier lvalue
          const { location } = resolveSymbol(
            context,
            (node.expression as Ast.Identifier).token.value,
          );

          return {
            code: concat([
              push(0), //        [0]
              push(location), // [location, 0]
              Code.MSTORE, //    []
            ]),
            stack: 1,
          };
        }

        case Token.disc.Not: {
          return {
            code: concat([expression.code, push(1), Code.XOR]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseNot: {
          return {
            code: concat([expression.code, Code.NOT]),
            stack: 1,
          };
        }

        default:
          never(node.operator);
          throw new InvariantViolationError();
      }
    }

    case Ast.disc.BinaryOperation: {
      const left = compileExpression(context, node.left);
      const right = compileExpression(context, node.right);

      switch (node.operator.token) {
        case Token.disc.Add: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([right.code, left.code, Code.ADD, mask]),
            stack: 1,
          };
        }

        case Token.disc.Subtract: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([right.code, left.code, Code.SUB, mask]),
            stack: 1,
          };
        }

        case Token.disc.Mul: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([right.code, left.code, Code.MUL, mask]),
            stack: 1,
          };
        }

        case Token.disc.Divide: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([
              right.code,
              left.code,
              isSignedArithmetic(context, node) ? Code.SDIV : Code.DIV,
              mask,
            ]),
            stack: 1,
          };
        }

        case Token.disc.Modulo: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([
              right.code,
              left.code,
              isSignedArithmetic(context, node) ? Code.SMOD : Code.MOD,
              mask,
            ]),
            stack: 1,
          };
        }

        case Token.disc.Power: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([right.code, left.code, Code.EXP, mask]),
            stack: 1,
          };
        }

        case Token.disc.And: {
          return {
            code: concat([right.code, left.code, Code.AND]),
            stack: 1,
          };
        }

        case Token.disc.Or: {
          return {
            code: concat([right.code, left.code, Code.OR]),
            stack: 1,
          };
        }

        case Token.disc.Equal: {
          return {
            code: concat([right.code, left.code, Code.EQ]),
            stack: 1,
          };
        }

        case Token.disc.NotEqual: {
          return {
            code: concat([right.code, left.code, Code.EQ, Code.ISZERO]),
            stack: 1,
          };
        }

        case Token.disc.Less: {
          return {
            code: concat([
              right.code,
              left.code,
              isSignedArithmetic(context, node.left) || isSignedArithmetic(context, node.right)
                ? Code.SLT
                : Code.LT,
            ]),
            stack: 1,
          };
        }

        case Token.disc.LessEqual: {
          return {
            code: concat([
              right.code, // [b]
              left.code, //  [a, b]
              Code.DUP2, //  [b, a, b]
              Code.DUP2, //  [a, b, a, b]
              isSignedArithmetic(context, node.left) || isSignedArithmetic(context, node.right)
                ? Code.SLT
                : Code.LT,
              //             [a < b, a, b]
              Code.SWAP2, // [b, a, a < b]
              Code.EQ, //    [a == b, a < b]
              Code.OR, //    [a <= b]
            ]),
            stack: 1,
          };
        }

        case Token.disc.More: {
          return {
            code: concat([
              right.code,
              left.code,
              isSignedArithmetic(context, node.left) || isSignedArithmetic(context, node.right)
                ? Code.SGT
                : Code.GT,
            ]),
            stack: 1,
          };
        }

        case Token.disc.MoreEqual: {
          return {
            code: concat([
              right.code, // [b]
              left.code, //  [a, b]
              Code.DUP2, //  [b, a, b]
              Code.DUP2, //  [a, b, a, b]
              isSignedArithmetic(context, node.left) || isSignedArithmetic(context, node.right)
                ? Code.SGT
                : Code.GT,
              //             [a > b, a, b]
              Code.SWAP2, // [b, a, a > b]
              Code.EQ, //    [a == b, a > b]
              Code.OR, //    [a >= b]
            ]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseAnd: {
          return {
            code: concat([right.code, left.code, Code.AND]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseOr: {
          return {
            code: concat([right.code, left.code, Code.OR]),
            stack: 1,
          };
        }

        case Token.disc.BitwiseXOr: {
          return {
            code: concat([right.code, left.code, Code.XOR]),
            stack: 1,
          };
        }

        case Token.disc.ShiftLeft: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([left.code, right.code, Code.SHL, mask]),
            stack: 1,
          };
        }

        case Token.disc.ShiftRight: {
          const bits = getBits(context, node);
          const mask = bits === 256 ? "0x" : concat([push(getMask(bits)), Code.AND]);
          return {
            code: concat([left.code, right.code, Code.SHR, mask]),
            stack: 1,
          };
        }

        default:
          never(node.operator);
          throw new InvariantViolationError();
      }
    }

    case Ast.disc.ConditionalExpression: {
      const condition = compileExpression(context, node.condition);
      const trueExpression = compileExpression(context, node.trueExpression);
      const falseExpression = compileExpression(context, node.falseExpression);

      const trueExpressionBytes = size(trueExpression.code);
      const falseExpressionBytes = size(falseExpression.code);

      return {
        code: concat([
          condition.code,
          Code.PC,
          push(
            6 +
              (trueExpressionBytes > 255 ? 3 : 2) +
              (falseExpressionBytes > 255 ? 3 : 2) +
              falseExpressionBytes,
          ),
          Code.ADD,
          Code.JUMPI,
          falseExpression.code,
          Code.PC,
          push(4 + (trueExpressionBytes > 255 ? 3 : 2) + trueExpressionBytes),
          Code.ADD,
          Code.JUMP,
          Code.JUMPDEST,
          trueExpression.code,
          Code.JUMPDEST,
        ]),
        stack: trueExpression.stack,
      };
    }

    case Ast.disc.FunctionCallExpression:
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
            push(context.freeMemoryPointer),
            Code.MSTORE,
          ]);

          context.freeMemoryPointer += 0x20;
        }

        const call = concat([
          expression.code, //                             [address]
          push(context.freeMemoryPointer), //             [ret_offset, address]
          push(functionType.parameters.length * 0x20), // [arg_size, ret_offset, address]
          push(inputLocation), //                         [arg_offset, arg_size, ret_offset, address]
          push(0), //                                     [value, arg_offset, arg_size, ret_offset, address]
          push(functionType.returns.length * 0x20), //    [ret_size, value, arg_offset, arg_size, ret_offset, address]
          Code.SWAP5, //                                  [address, value, arg_offset, arg_size, ret_offset, ret_size]
          Code.GAS, //                                    [gas, address, value, arg_offset, arg_size, ret_offset, ret_size]
          Code.CALL, //                                   [success]
          Code.POP, //                                    []
        ]);

        let _return: Hex = "0x";
        for (let i = 0; i < functionType.returns.length; i++) {
          _return = concat([
            _return,
            push(context.freeMemoryPointer + functionType.returns.length * 0x20 - (i + 1) * 0x20),
            Code.MLOAD,
          ]);
        }

        context.freeMemoryPointer = inputLocation;

        return {
          code: concat([input, call, _return]),
          stack: functionType.returns.length,
        };
      }

      throw new InvariantViolationError();

    case Ast.disc.MemberAccessExpression: {
      if (node.expression.ast === Ast.disc.Identifier && node.expression.token.value === "block") {
        switch (node.member.token.value) {
          case "basefee": {
            return { code: Code.BASEFEE, stack: 1 };
          }

          case "blobbasefee": {
            return { code: Code.BLOBBASEFEE, stack: 1 };
          }

          case "chainid": {
            return { code: Code.CHAINID, stack: 1 };
          }

          case "coinbase": {
            return { code: Code.COINBASE, stack: 1 };
          }

          case "difficulty": {
            return { code: Code.PREVRANDAO, stack: 1 };
          }

          case "gaslimit": {
            return { code: Code.GASLIMIT, stack: 1 };
          }

          case "number": {
            return { code: Code.NUMBER, stack: 1 };
          }

          case "prevrandao": {
            return { code: Code.PREVRANDAO, stack: 1 };
          }

          case "timestamp": {
            return { code: Code.TIMESTAMP, stack: 1 };
          }

          default:
            throw new InvariantViolationError();
        }
      }

      if (node.expression.ast === Ast.disc.Identifier && node.expression.token.value === "tx") {
        switch (node.member.token.value) {
          case "gasprice": {
            return { code: Code.GASPRICE, stack: 1 };
          }

          case "origin": {
            return { code: Code.ORIGIN, stack: 1 };
          }

          default:
            throw new InvariantViolationError();
        }
      }

      if (node.expression.ast === Ast.disc.Identifier && node.expression.token.value === "msg") {
        switch (node.member.token.value) {
          // case "data": { }

          case "sender": {
            return { code: Code.CALLER, stack: 1 };
          }

          case "sig": {
            return {
              code: concat([push(0), Code.CALLDATALOAD, push(getMask(32)), Code.AND]),
              stack: 1,
            };
          }

          case "value": {
            return { code: Code.CALLVALUE, stack: 1 };
          }

          default:
            throw new InvariantViolationError();
        }
      }

      throw new InvariantViolationError();
    }

    case Ast.disc.IndexAccessExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "index access",
      });

    case Ast.disc.IndexRangeAccessExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "index range access",
      });

    case Ast.disc.NewExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: node.loc,
        feature: "contract creation",
      });

    case Ast.disc.TupleExpression: {
      let code: Hex = "0x";
      let stack = 0;

      for (const element of node.elements) {
        const expression = compileExpression(context, element!);
        code = concat([code, expression.code]);
        stack += expression.stack;
      }
      return { code, stack };
    }
  }
};
