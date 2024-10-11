import { InvariantViolationError } from "./errors/invariantViolation";
import { NotImplementedError } from "./errors/notImplemented";
import { TypeError } from "./errors/type";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import { Type } from "./types/type";
import { never } from "./utils/never";

export type CheckContext = {
  source: string;
  symbols: Map<string, Type.Type>[];
  functionSymbols: Map<string, Type.Function[]>[];
  annotations: Map<Ast.Expression, Type.Type>;
  /**
   * Temporary storage for function argument types, used for deciding
   * which function is being targeted in the case of overloading.
   */
  arguments: Map<Ast.Expression, Type.Type[]>;
  isContractScope: boolean;
};

export type TypeAnnotations = CheckContext["annotations"];

// abi
// keccak256
// blockhash
// blobhash
// gasleft
// sha256
// ripemd160
// ecrecover
// addmod
// mulmod
// this
// super
// selfdestruct

export const defaultSymbols = new Map<string, Type.Type>([
  [
    "block",
    {
      type: Type.disc.Struct,
      members: new Map<string, Type.Type>([
        ["basefee", Type.staticUintSize(256)],
        ["blobbasefee", Type.staticUintSize(256)],
        ["chainid", Type.staticUintSize(256)],
        ["coinbase", Type.staticAddress],
        ["difficulty", Type.staticUintSize(256)],
        ["gaslimit", Type.staticUintSize(256)],
        ["number", Type.staticUintSize(256)],
        ["prevrandao", Type.staticUintSize(256)],
        ["timestamp", Type.staticUintSize(256)],
      ]),
    },
  ],
  [
    "msg",
    {
      type: Type.disc.Struct,
      members: new Map<string, Type.Type>([
        ["data", Type.staticBytes],
        ["sender", Type.staticAddress],
        ["sig", Type.staticBytesSize(4)],
        ["value", Type.staticUintSize(256)],
      ]),
    },
  ],
  [
    "tx",
    {
      type: Type.disc.Struct,
      members: new Map<string, Type.Type>([
        ["gasprice", Type.staticUintSize(256)],
        ["origin", Type.staticAddress],
      ]),
    },
  ],
]);

export const defaultFunctionSymbols = new Map<string, Type.Function[]>([
  ["address", [Type.conversion(Type.staticAddress)]],
  ["string", [Type.conversion(Type.staticString)]],
  ["bytes", [Type.conversion(Type.staticBytes)]],
  ["bool", [Type.conversion(Type.staticBool)]],
  ["int8", [Type.conversion(Type.staticIntSize(8))]],
  ["int16", [Type.conversion(Type.staticIntSize(16))]],
  ["int24", [Type.conversion(Type.staticIntSize(24))]],
  ["int32", [Type.conversion(Type.staticIntSize(32))]],
  ["int40", [Type.conversion(Type.staticIntSize(40))]],
  ["int48", [Type.conversion(Type.staticIntSize(48))]],
  ["int56", [Type.conversion(Type.staticIntSize(56))]],
  ["int64", [Type.conversion(Type.staticIntSize(64))]],
  ["int72", [Type.conversion(Type.staticIntSize(72))]],
  ["int80", [Type.conversion(Type.staticIntSize(80))]],
  ["int88", [Type.conversion(Type.staticIntSize(88))]],
  ["int96", [Type.conversion(Type.staticIntSize(96))]],
  ["int104", [Type.conversion(Type.staticIntSize(104))]],
  ["int112", [Type.conversion(Type.staticIntSize(112))]],
  ["int120", [Type.conversion(Type.staticIntSize(120))]],
  ["int128", [Type.conversion(Type.staticIntSize(128))]],
  ["int136", [Type.conversion(Type.staticIntSize(136))]],
  ["int144", [Type.conversion(Type.staticIntSize(144))]],
  ["int152", [Type.conversion(Type.staticIntSize(152))]],
  ["int160", [Type.conversion(Type.staticIntSize(160))]],
  ["int168", [Type.conversion(Type.staticIntSize(168))]],
  ["int176", [Type.conversion(Type.staticIntSize(176))]],
  ["int184", [Type.conversion(Type.staticIntSize(184))]],
  ["int192", [Type.conversion(Type.staticIntSize(192))]],
  ["int200", [Type.conversion(Type.staticIntSize(200))]],
  ["int208", [Type.conversion(Type.staticIntSize(208))]],
  ["int216", [Type.conversion(Type.staticIntSize(216))]],
  ["int224", [Type.conversion(Type.staticIntSize(224))]],
  ["int232", [Type.conversion(Type.staticIntSize(232))]],
  ["int240", [Type.conversion(Type.staticIntSize(240))]],
  ["int248", [Type.conversion(Type.staticIntSize(248))]],
  ["int256", [Type.conversion(Type.staticIntSize(256))]],
  ["uint8", [Type.conversion(Type.staticUintSize(8))]],
  ["uint16", [Type.conversion(Type.staticUintSize(16))]],
  ["uint24", [Type.conversion(Type.staticUintSize(24))]],
  ["uint32", [Type.conversion(Type.staticUintSize(32))]],
  ["uint40", [Type.conversion(Type.staticUintSize(40))]],
  ["uint48", [Type.conversion(Type.staticUintSize(48))]],
  ["uint56", [Type.conversion(Type.staticUintSize(56))]],
  ["uint64", [Type.conversion(Type.staticUintSize(64))]],
  ["uint72", [Type.conversion(Type.staticUintSize(72))]],
  ["uint80", [Type.conversion(Type.staticUintSize(80))]],
  ["uint88", [Type.conversion(Type.staticUintSize(88))]],
  ["uint96", [Type.conversion(Type.staticUintSize(96))]],
  ["uint104", [Type.conversion(Type.staticUintSize(104))]],
  ["uint112", [Type.conversion(Type.staticUintSize(112))]],
  ["uint120", [Type.conversion(Type.staticUintSize(120))]],
  ["uint128", [Type.conversion(Type.staticUintSize(128))]],
  ["uint136", [Type.conversion(Type.staticUintSize(136))]],
  ["uint144", [Type.conversion(Type.staticUintSize(144))]],
  ["uint152", [Type.conversion(Type.staticUintSize(152))]],
  ["uint160", [Type.conversion(Type.staticUintSize(160))]],
  ["uint168", [Type.conversion(Type.staticUintSize(168))]],
  ["uint176", [Type.conversion(Type.staticUintSize(176))]],
  ["uint184", [Type.conversion(Type.staticUintSize(184))]],
  ["uint192", [Type.conversion(Type.staticUintSize(192))]],
  ["uint200", [Type.conversion(Type.staticUintSize(200))]],
  ["uint208", [Type.conversion(Type.staticUintSize(208))]],
  ["uint216", [Type.conversion(Type.staticUintSize(216))]],
  ["uint224", [Type.conversion(Type.staticUintSize(224))]],
  ["uint232", [Type.conversion(Type.staticUintSize(232))]],
  ["uint240", [Type.conversion(Type.staticUintSize(240))]],
  ["uint248", [Type.conversion(Type.staticUintSize(248))]],
  ["uint256", [Type.conversion(Type.staticUintSize(256))]],
  ["bytes1", [Type.conversion(Type.staticBytesSize(1))]],
  ["bytes2", [Type.conversion(Type.staticBytesSize(2))]],
  ["bytes3", [Type.conversion(Type.staticBytesSize(3))]],
  ["bytes4", [Type.conversion(Type.staticBytesSize(4))]],
  ["bytes5", [Type.conversion(Type.staticBytesSize(5))]],
  ["bytes6", [Type.conversion(Type.staticBytesSize(6))]],
  ["bytes7", [Type.conversion(Type.staticBytesSize(7))]],
  ["bytes8", [Type.conversion(Type.staticBytesSize(8))]],
  ["bytes9", [Type.conversion(Type.staticBytesSize(9))]],
  ["bytes10", [Type.conversion(Type.staticBytesSize(10))]],
  ["bytes11", [Type.conversion(Type.staticBytesSize(11))]],
  ["bytes12", [Type.conversion(Type.staticBytesSize(12))]],
  ["bytes13", [Type.conversion(Type.staticBytesSize(13))]],
  ["bytes14", [Type.conversion(Type.staticBytesSize(14))]],
  ["bytes15", [Type.conversion(Type.staticBytesSize(15))]],
  ["bytes16", [Type.conversion(Type.staticBytesSize(16))]],
  ["bytes17", [Type.conversion(Type.staticBytesSize(17))]],
  ["bytes18", [Type.conversion(Type.staticBytesSize(18))]],
  ["bytes19", [Type.conversion(Type.staticBytesSize(19))]],
  ["bytes20", [Type.conversion(Type.staticBytesSize(20))]],
  ["bytes21", [Type.conversion(Type.staticBytesSize(21))]],
  ["bytes22", [Type.conversion(Type.staticBytesSize(22))]],
  ["bytes23", [Type.conversion(Type.staticBytesSize(23))]],
  ["bytes24", [Type.conversion(Type.staticBytesSize(24))]],
  ["bytes25", [Type.conversion(Type.staticBytesSize(25))]],
  ["bytes26", [Type.conversion(Type.staticBytesSize(26))]],
  ["bytes27", [Type.conversion(Type.staticBytesSize(27))]],
  ["bytes28", [Type.conversion(Type.staticBytesSize(28))]],
  ["bytes29", [Type.conversion(Type.staticBytesSize(29))]],
  ["bytes30", [Type.conversion(Type.staticBytesSize(30))]],
  ["bytes31", [Type.conversion(Type.staticBytesSize(31))]],
  ["bytes32", [Type.conversion(Type.staticBytesSize(32))]],
]);

export const check = (source: string, program: Ast.Program): TypeAnnotations => {
  const context: CheckContext = {
    source,
    symbols: [defaultSymbols, new Map()],
    functionSymbols: [defaultFunctionSymbols, new Map()],
    annotations: new Map(),
    arguments: new Map(),
    isContractScope: false,
  };

  for (const definition of program) {
    if (definition.ast !== Ast.disc.PragmaDirective) {
      checkDefinition(context, definition);
    }
  }

  return context.annotations;
};

const addSymbol = (context: CheckContext, symbol: string, type: Type.Type) => {
  const scope = context.symbols[context.symbols.length - 1]!;
  const functionScope = context.functionSymbols[context.symbols.length - 1]!;

  const existingSymbol = scope.get(symbol);
  const existingFunctionSymbol = functionScope.get(symbol);

  if (
    existingSymbol !== undefined &&
    (type.type !== Type.disc.Function || type.isTypeConversion === false)
  )
    throw new TypeError("Identifier already declared", 2333);

  if (type.type === Type.disc.Function) {
    if (existingFunctionSymbol === undefined) functionScope.set(symbol, []);
    else {
      for (const functionType of existingFunctionSymbol) {
        if (
          type.parameters.length === functionType.parameters.length &&
          type.parameters.every((p, i) => p.type === functionType.parameters[i]!.type)
        ) {
          throw new TypeError("Function with same name and parameter types defined twice", 1686);
        }
      }
    }

    functionScope.get(symbol)!.push(type);
  } else {
    scope.set(symbol, type);
  }
};

const resolveSymbol = (context: CheckContext, symbol: string): Type.Type => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    if (scope?.has(symbol)) return scope.get(symbol)!;
  }
  // TODO(kyle) Identifier not found or not unique.solidity(7920)
  throw new TypeError("Undeclared identifier", 7576);
};

const resolveFunctionSymbol = (
  context: CheckContext,
  symbol: string,
  argumentTypes: Type.Type[],
): Type.Type => {
  for (let i = context.functionSymbols.length - 1; i >= 0; i--) {
    const scope = context.functionSymbols[i];
    if (scope?.has(symbol)) {
      const functionTypes = scope!.get(symbol)!;
      if (functionTypes.length === 1) return functionTypes[0]!;
      for (const functionType of functionTypes) {
        if (
          functionType.parameters.length === argumentTypes.length &&
          argumentTypes.every((type, i) =>
            (functionType.isTypeConversion ? isExplicitlyConvertibleTo : isImplicitlyConvertibleTo)(
              type,
              functionType.parameters[i]!,
            ),
          )
        ) {
          return functionType;
        }
        // Member "run" not unique after argument-dependent lookup in contract Contract1.solidity(6675)
      }
    }
  }

  console.log(symbol, argumentTypes);

  throw new TypeError("Undeclared identifier", 7576);
};

const enterScope = (context: CheckContext) => {
  context.symbols.push(new Map());
  context.functionSymbols.push(new Map());
};

const exitScope = (context: CheckContext) => {
  context.symbols.pop();
  context.functionSymbols.pop();
};

export const checkDefinition = (context: CheckContext, definition: Ast.Definition): void => {
  switch (definition.ast) {
    case Ast.disc.VariableDefinition:
      throw new NotImplementedError({
        source: context.source,
        loc: definition.loc,
        feature: "variable defintion",
      });

    case Ast.disc.FunctionDefinition: {
      switch (definition.kind.token) {
        case Token.disc.Function: {
          const type = {
            type: Type.disc.Function,
            parameters: definition.parameters.map((param) => Type.convertAst(param.type)),
            returns: definition.returns.map((ret) => Type.convertAst(ret.type)),
            isTypeConversion: false,
          } satisfies Type.Function;

          addSymbol(context, definition.name!.value, type);

          // TODO(kyle) check matching return type
          // TODO(kyle) check state mutability

          if (definition.body !== undefined) checkStatement(context, definition.body);
          break;
        }
      }
      return;
    }

    case Ast.disc.ContractDefinition:
      context.isContractScope = true;
      addSymbol(context, definition.name.value, Type.convertAst(definition));
      addSymbol(context, definition.name.value, {
        type: Type.disc.Function,
        parameters: [Type.convertAst(definition)],
        returns: [Type.convertAst(definition)],
        isTypeConversion: true,
      });

      enterScope(context);
      for (const _definition of definition.nodes) {
        checkDefinition(context, _definition);
      }
      exitScope(context);
      context.isContractScope = false;

      break;

    case Ast.disc.EventDefinition:
      throw new NotImplementedError({
        source: context.source,
        loc: definition.loc,
        feature: "event defintion",
      });

    case Ast.disc.ErrorDefinition:
      throw new NotImplementedError({
        source: context.source,
        loc: definition.loc,
        feature: "error defintion",
      });

    case Ast.disc.StructDefinition:
      throw new NotImplementedError({
        source: context.source,
        loc: definition.loc,
        feature: "struct defintion",
      });

    case Ast.disc.ModifierDefinition:
      throw new NotImplementedError({
        source: context.source,
        loc: definition.loc,
        feature: "modifier defintion",
      });

    default:
      never(definition);
  }
};

export const checkStatement = (context: CheckContext, statement: Ast.Statement): void => {
  switch (statement.ast) {
    case Ast.disc.VariableDeclaration:
      for (const declaration of statement.declarations) {
        if (declaration.identifier) {
          let type: Type.Type;
          if (declaration.type.ast === Ast.disc.UserDefinedType) {
            // Identifier not found or not unique.solidity(7920)
            type = resolveSymbol(context, declaration.type.type.value);
          } else {
            type = Type.convertAst(declaration.type);
          }
          addSymbol(context, declaration.identifier.value, type);
        }
      }
      if (statement.initializer) {
        const initializer = checkExpression(context, statement.initializer);
        context.annotations.set(statement.initializer, initializer);
        // TODO(kyle) support array of declarations

        let type: Type.Type;
        if (statement.declarations[0]!.type.ast === Ast.disc.UserDefinedType) {
          type = resolveSymbol(context, statement.declarations[0]!.type.type.value);
        } else {
          type = Type.convertAst(statement.declarations[0]!.type);
        }
        if (isImplicitlyConvertibleTo(initializer, type) === false) {
          throw new TypeError(
            `Type ${initializer} is not implicitly convertible to expected type ${statement.declarations[0]!.type}`,
            9574,
          );
        }
      }
      break;

    case Ast.disc.ExpressionStatement: {
      const expression = checkExpression(context, statement.expression);
      context.annotations.set(statement.expression, expression);
      break;
    }

    case Ast.disc.BlockStatement:
      enterScope(context);
      for (const _statement of statement.statements) {
        checkStatement(context, _statement);
      }
      exitScope(context);
      break;

    case Ast.disc.UncheckedBlockStatement:
      enterScope(context);
      for (const _statement of statement.statements) {
        checkStatement(context, _statement);
      }
      exitScope(context);
      break;

    case Ast.disc.IfStatement:
    case Ast.disc.ForStatement:
    case Ast.disc.WhileStatement:
    case Ast.disc.DoWhileStatement:
    case Ast.disc.BreakStatement:
    case Ast.disc.ContinueStatement:
    case Ast.disc.EmitStatement:
    case Ast.disc.RevertStatement:
    case Ast.disc.ReturnStatement:
    case Ast.disc.PlaceholderStatement:
      break;

    default:
      never(statement);
  }
};

export const checkExpression = (context: CheckContext, expression: Ast.Expression): Type.Type => {
  switch (expression.ast) {
    case Ast.disc.Identifier: {
      if (context.arguments.has(expression)) {
        // TODO(kyle) return array, only filter if one
        return resolveFunctionSymbol(
          context,
          expression.token.value,
          context.arguments.get(expression)!,
        );
      }
      return resolveSymbol(context, expression.token.value);
    }

    case Ast.disc.Literal:
      switch (expression.token.token) {
        case Token.disc.AddressLiteral:
          return {
            type: Type.disc.Elementary,
            value: { token: Token.disc.Address },
            isLiteral: true,
          };

        case Token.disc.StringLiteral:
          return {
            type: Type.disc.Elementary,
            value: { token: Token.disc.String },
            isLiteral: true,
          };

        case Token.disc.HexLiteral:
          return {
            type: Type.disc.Elementary,
            value: { token: Token.disc.Bytes },
            isLiteral: true,
          };

        case Token.disc.NumberLiteral:
          return {
            type: Type.disc.Elementary,
            value: { token: Token.disc.Uint, size: 256 },
            isLiteral: true,
          };

        case Token.disc.HexNumberLiteral:
          return {
            type: Type.disc.Elementary,
            value: { token: Token.disc.Uint, size: 256 },
            isLiteral: true,
          };

        case Token.disc.BoolLiteral:
          return {
            type: Type.disc.Elementary,
            value: { token: Token.disc.Bool },
            isLiteral: true,
          };

        default:
          never(expression.token);
      }
      break;

    case Ast.disc.Assignment: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);
      context.annotations.set(expression.left, left);
      context.annotations.set(expression.right, right);

      switch (expression.operator.token) {
        case Token.disc.Assign: {
          if (isLValue(context, expression.left) === false) {
            throw new TypeError("Expression has to be an lvalue", 4247);
          }

          if (isImplicitlyConvertibleTo(left, right) === false) {
            throw new TypeError(
              `Type ${left} is not implicitly convertible to expected type ${right}`,
              7407,
            );
          }

          return left;
        }

        case Token.disc.AddAssign:
        case Token.disc.SubtractAssign:
        case Token.disc.MulAssign:
        case Token.disc.DivideAssign: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint && left.value.token !== Token.disc.Int) ||
            (right.value.token !== Token.disc.Uint && right.value.token !== Token.disc.Int) ||
            left.value.token !== right.value.token ||
            left.value.size < right.value.size
          ) {
            throw new TypeError(
              `Operator ${expression.operator} not compatible with types ${left.type} and ${right.type}`,
              7366,
            );
          }

          return left;
        }

        case Token.disc.ModuloAssign: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint && left.value.token !== Token.disc.Int) ||
            (right.value.token !== Token.disc.Uint && right.value.token !== Token.disc.Int) ||
            left.value.token !== right.value.token ||
            left.value.size < right.value.size
          ) {
            throw new TypeError(
              `Operator ${expression.operator} not compatible with types ${left.type} and ${right.type}`,
              7366,
            );
          }

          return left;
        }

        case Token.disc.BitwiseAndAssign:
        case Token.disc.BitwiseOrAssign:
        case Token.disc.BitwiseXOrAssign: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint &&
              left.value.token !== Token.disc.Int &&
              left.value.token !== Token.disc.Byte) ||
            (right.value.token !== Token.disc.Uint &&
              right.value.token !== Token.disc.Int &&
              right.value.token !== Token.disc.Byte) ||
            left.value.token !== right.value.token ||
            left.value.size < right.value.size
          ) {
            throw new TypeError(
              `Operator ${expression.operator} not compatible with types ${left.type} and ${right.type}`,
              7366,
            );
          }

          return left;
        }

        case Token.disc.ShiftLeftAssign:
        case Token.disc.ShiftRightAssign: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint &&
              left.value.token !== Token.disc.Int &&
              left.value.token !== Token.disc.Byte) ||
            (right.value.token !== Token.disc.Uint &&
              right.value.token !== Token.disc.Int &&
              right.value.token !== Token.disc.Byte) ||
            left.value.token !== right.value.token
          ) {
            throw new TypeError(
              `Operator ${expression.operator} not compatible with types ${left.type} and ${right.type}`,
              7366,
            );
          }

          return left;
        }

        default:
          never(expression.operator);
          throw new InvariantViolationError();
      }
    }

    case Ast.disc.UnaryOperation: {
      const _expression = checkExpression(context, expression.expression);
      context.annotations.set(expression.expression, _expression);

      switch (expression.operator.token) {
        case Token.disc.Increment:
        case Token.disc.Decrement:
          if (isLValue(context, expression.expression) === false) {
            throw new TypeError("Expression has to be an lvalue", 4247);
          }

          if (
            _expression.type !== Type.disc.Elementary ||
            (_expression.value.token !== Token.disc.Uint &&
              _expression.value.token !== Token.disc.Int) ||
            _expression.isLiteral
          ) {
            throw new TypeError("Built-in unary operator ++ cannot be applied to type ${}", 9767);
          }
          break;

        case Token.disc.Subtract: {
          if (
            _expression.type !== Type.disc.Elementary ||
            // TODO(kyle) allow uint literals
            (_expression.value.token !== Token.disc.Int && _expression.isLiteral === false)
          ) {
            throw new TypeError(
              `Built-in unary operator ${expression.operator} cannot be applied to type ${_expression}`,
              4907,
            );
          }

          return {
            type: Type.disc.Elementary,
            isLiteral: _expression.isLiteral,
            value: Type.staticIntSize(_expression.type).value,
          };
        }

        case Token.disc.Delete: {
          if (isLValue(context, expression.expression) === false) {
            throw new TypeError("Expression has to be an lvalue", 4247);
          }

          if (_expression.type !== Type.disc.Elementary || _expression.isLiteral) {
            throw new TypeError(
              "Built-in unary operator delete cannot be applied to type ${}",
              9767,
            );
          }

          // TODO(kyle) is there a way to represent this differently?
          return {
            type: Type.disc.Tuple,
            elements: [],
          };
        }

        case Token.disc.Not: {
          if (
            _expression.type !== Type.disc.Elementary ||
            _expression.value.token !== Token.disc.Bool
          ) {
            throw new TypeError("Built-in unary operator ! cannot be applied to type ${}", 4907);
          }
          break;
        }

        case Token.disc.BitwiseNot:
          if (
            _expression.type !== Type.disc.Elementary ||
            (_expression.value.token !== Token.disc.Uint &&
              _expression.value.token !== Token.disc.Int &&
              _expression.value.token !== Token.disc.Byte)
          ) {
            throw new TypeError("Built-in unary operator ~ cannot be applied to type ${}", 4907);
          }

          break;

        default:
          never(expression.operator);
          throw new InvariantViolationError();
      }

      return _expression;
    }

    case Ast.disc.BinaryOperation: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);
      context.annotations.set(expression.left, left);
      context.annotations.set(expression.right, right);

      switch (expression.operator.token) {
        case Token.disc.Add:
        case Token.disc.Subtract:
        case Token.disc.Mul:
        case Token.disc.Divide: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint && left.value.token !== Token.disc.Int) ||
            (right.value.token !== Token.disc.Uint && right.value.token !== Token.disc.Int) ||
            left.value.token !== right.value.token
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          return {
            type: Type.disc.Elementary,
            value: {
              token: left.value.token,
              size: Math.max(left.value.size, right.value.size),
            },
            isLiteral: false,
          };
        }

        case Token.disc.Modulo: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint && left.value.token !== Token.disc.Int) ||
            (right.value.token !== Token.disc.Uint && right.value.token !== Token.disc.Int)
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          const isSigned =
            left.value.token === Token.disc.Int || right.value.token === Token.disc.Int;
          return {
            type: Type.disc.Elementary,
            value: {
              token: isSigned ? Token.disc.Int : Token.disc.Uint,
              size: Math.max(left.value.size, right.value.size),
            },
            isLiteral: false,
          };
        }

        case Token.disc.Power: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint && left.value.token !== Token.disc.Int) ||
            right.value.token !== Token.disc.Uint
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          if (left.value.size < right.value.size && right.isLiteral === false) {
            throw new TypeError(
              `The result type of the exponentiation operation is equal to the type of the first operand (${left.type}) ignoring the (larger) type of the second operand (${right.type}) which might be unexpected. Silence this warning by either converting the first or the second operand to the type of the other.`,
              3149,
            );
          }

          return {
            type: Type.disc.Elementary,
            value: left.value,
            isLiteral: false,
          };
        }

        case Token.disc.And:
        case Token.disc.Or: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            left.value.token !== Token.disc.Bool ||
            right.value.token !== Token.disc.Bool
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          return Type.staticBool;
        }

        case Token.disc.Equal:
        case Token.disc.NotEqual: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            left.value.token === Token.disc.String ||
            left.value.token === Token.disc.Bytes ||
            right.value.token === Token.disc.String ||
            right.value.token === Token.disc.Bytes ||
            left.value.token !== right.value.token
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          return Type.staticBool;
        }

        case Token.disc.Less:
        case Token.disc.LessEqual:
        case Token.disc.More:
        case Token.disc.MoreEqual: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            left.value.token === Token.disc.String ||
            left.value.token === Token.disc.Bytes ||
            left.value.token === Token.disc.Bool ||
            right.value.token === Token.disc.String ||
            right.value.token === Token.disc.Bytes ||
            right.value.token === Token.disc.Bool ||
            left.value.token !== right.value.token
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          return Type.staticBool;
        }

        case Token.disc.BitwiseAnd:
        case Token.disc.BitwiseOr:
        case Token.disc.BitwiseXOr: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint &&
              left.value.token !== Token.disc.Int &&
              left.value.token !== Token.disc.Byte) ||
            (right.value.token !== Token.disc.Uint &&
              right.value.token !== Token.disc.Int &&
              right.value.token !== Token.disc.Byte) ||
            left.value.token !== right.value.token
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          return left;
        }

        case Token.disc.ShiftRight:
        case Token.disc.ShiftLeft: {
          if (
            left.type !== Type.disc.Elementary ||
            right.type !== Type.disc.Elementary ||
            (left.value.token !== Token.disc.Uint &&
              left.value.token !== Token.disc.Int &&
              left.value.token !== Token.disc.Byte) ||
            (right.value.token !== Token.disc.Uint &&
              right.value.token !== Token.disc.Int &&
              right.value.token !== Token.disc.Byte) ||
            left.value.token !== right.value.token
          ) {
            throw new TypeError(
              `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
              2271,
            );
          }

          return left;
        }

        default:
          never(expression.operator);
          throw new InvariantViolationError();
      }
    }

    case Ast.disc.ConditionalExpression: {
      const condition = checkExpression(context, expression.condition);
      const trueExpression = checkExpression(context, expression.trueExpression);
      const falseExpression = checkExpression(context, expression.falseExpression);
      context.annotations.set(expression.condition, condition);
      context.annotations.set(expression.trueExpression, trueExpression);
      context.annotations.set(expression.falseExpression, falseExpression);

      if (
        isImplicitlyConvertibleTo(condition, {
          type: Type.disc.Elementary,
          value: { token: Token.disc.Bool },
          isLiteral: false,
        }) === false
      ) {
        throw new TypeError(
          `Type ${condition} is not implicitly convertible to expected type bool`,
          7407,
        );
      }
      if (isImplicitlyConvertibleTo(trueExpression, falseExpression) === false) {
        throw new TypeError(
          `True expressions's type ${trueExpression} does not match false expressions type ${falseExpression}`,
          1080,
        );
      }

      return trueExpression;
    }

    case Ast.disc.FunctionCallExpression: {
      const argumentTypes = expression.arguments.map((argument) => {
        const argumentType = checkExpression(context, argument);
        context.annotations.set(argument, argumentType);
        return argumentType;
      });

      context.arguments.set(expression.expression, argumentTypes);

      const expressionType = checkExpression(context, expression.expression);

      if (expressionType.type !== Type.disc.Function) {
        throw new TypeError("This expression is not callable", 5704);
      }

      context.arguments.delete(expression.expression);

      if (expressionType.parameters.length !== expression.arguments.length) {
        throw new TypeError(
          `Wrong argument count for function call: ${expression.arguments.length} arguments given but expected ${expressionType.parameters.length}.`,
          6160,
        );
      }

      for (const argumentType of argumentTypes) {
        if (expressionType.isTypeConversion) {
          if (isExplicitlyConvertibleTo(argumentType, expressionType.returns[0]!) === false) {
            throw new TypeError(
              `Explicit type conversion is not allowed from "${argumentType}" to "${expressionType.returns[0]!}".`,
              9640,
            );
          }
        }
      }

      return Type.unwrap({ type: Type.disc.Tuple, elements: expressionType.returns });
    }

    case Ast.disc.MemberAccessExpression: {
      const expressionType = checkExpression(context, expression.expression);
      context.annotations.set(expression.expression, expressionType);

      if (expressionType.type === Type.disc.Contract) {
        const functionTypes = expressionType.functions.get(expression.member.token.value);

        if (functionTypes === undefined) {
          throw new TypeError(
            `Member "${expression.member.token.value}" not found or not visible after argument-dependent lookup in ${expressionType}`,
            9582,
          );
        }

        if (context.arguments.has(expression)) {
          const argumentTypes = context.arguments.get(expression)!;
          for (const functionType of functionTypes) {
            if (
              functionType.parameters.length === argumentTypes.length &&
              argumentTypes.every((type, i) =>
                isImplicitlyConvertibleTo(type, functionType.parameters[i]!),
              )
            ) {
              return functionType;
            }
          }
        } else {
          throw new InvariantViolationError();
        }
      }

      if (expressionType.type === Type.disc.Struct) {
        if (expressionType.members.has(expression.member.token.value)) {
          return expressionType.members.get(expression.member.token.value)!;
        }
      }

      throw new TypeError(
        `Member "${expression.member.token.value}" not found or not visible after argument-dependent lookup in ${expressionType}`,
        9582,
      );
    }

    case Ast.disc.IndexAccessExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: expression.loc,
        feature: "index access",
      });

    case Ast.disc.IndexRangeAccessExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: expression.loc,
        feature: "index range access",
      });

    case Ast.disc.NewExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: expression.loc,
        feature: "contract creation",
      });

    case Ast.disc.TupleExpression: {
      const elements = expression.elements.map((e) => {
        const type = checkExpression(context, e);
        context.annotations.set(e, type);
        return type;
      });

      return { type: Type.disc.Tuple, elements };
    }

    default:
      never(expression);
  }

  throw new InvariantViolationError();
};

const isExplicitlyConvertibleTo = (from: Type.Type, to: Type.Type): boolean => {
  if (isImplicitlyConvertibleTo(from, to)) return true;

  if (from.type === Type.disc.Elementary && to.type === Type.disc.Elementary) {
    if (from.value.token === to.value.token) return true;

    // integer to integer
    if (
      (from.value.token === Token.disc.Uint &&
        to.value.token === Token.disc.Int &&
        from.value.size === to.value.size) ||
      (from.value.token === Token.disc.Int &&
        to.value.token === Token.disc.Uint &&
        from.value.size === to.value.size)
    ) {
      return true;
    }

    // integer to address
    if (
      from.value.token === Token.disc.Uint &&
      to.value.token === Token.disc.Address &&
      from.value.size === 160
    ) {
      return true;
    }

    // address to integer
    if (
      from.value.token === Token.disc.Address &&
      to.value.token === Token.disc.Uint &&
      to.value.size === 160
    ) {
      return true;
    }

    // integer to fixed bytes
    if (
      from.value.token === Token.disc.Uint &&
      to.value.token === Token.disc.Byte &&
      from.value.size === to.value.size * 8
    ) {
      return true;
    }

    // fixed bytes to integer
    if (
      from.value.token === Token.disc.Byte &&
      to.value.token === Token.disc.Uint &&
      from.value.size * 8 === to.value.size
    ) {
      return true;
    }

    // fixed bytes to address
    if (
      from.value.token === Token.disc.Byte &&
      to.value.token === Token.disc.Address &&
      from.value.size === 20
    ) {
      return true;
    }

    // address to fixed bytes
    if (
      from.value.token === Token.disc.Address &&
      to.value.token === Token.disc.Byte &&
      to.value.size === 20
    ) {
      return true;
    }

    return false;
  }

  // address to contract
  if (
    from.type === Type.disc.Elementary &&
    to.type === Type.disc.Contract &&
    from.value.token === Token.disc.Address
  ) {
    return true;
  }

  // contract to address
  if (
    from.type === Type.disc.Contract &&
    to.type === Type.disc.Elementary &&
    to.value.token === Token.disc.Address
  ) {
    return true;
  }

  return false;
};

const isImplicitlyConvertibleTo = (from: Type.Type, to: Type.Type): boolean => {
  if (from.type === Type.disc.Elementary && to.type === Type.disc.Elementary) {
    if (isElementaryTypeEqual(from, to)) return true;

    // integer to integer
    if (
      (from.value.token === Token.disc.Uint &&
        to.value.token === Token.disc.Uint &&
        from.value.size <= to.value.size) ||
      (from.value.token === Token.disc.Int &&
        to.value.token === Token.disc.Int &&
        from.value.size <= to.value.size)
    ) {
      return true;
    }

    // integer literal
    if (
      from.value.token === Token.disc.Uint &&
      from.isLiteral &&
      (to.value.token === Token.disc.Uint || to.value.token === Token.disc.Int)
    ) {
      return true;
    }

    // fixed bytes to fixed bytes
    if (
      from.value.token === Token.disc.Byte &&
      to.value.token === Token.disc.Byte &&
      from.value.size <= to.value.size
    ) {
      return true;
    }
  } else if (
    from.type === Type.disc.Tuple &&
    to.type === Type.disc.Tuple &&
    from.elements.length === to.elements.length
  ) {
    return true;
  } else if (from.type === Type.disc.Contract && to.type === Type.disc.Contract) {
    // TODO(kyle) deep comparison
    return true;
  }

  return false;
};

const isElementaryTypeEqual = (a: Type.Elementary, b: Type.Elementary): boolean => {
  switch (a.value.token) {
    case Token.disc.Address:
    case Token.disc.String:
    case Token.disc.Bytes:
    case Token.disc.Bool:
      return a.value.token === b.value.token;

    case Token.disc.Uint:
    case Token.disc.Int:
    case Token.disc.Byte:
      return a.value.token === b.value.token && a.value.size === b.value.size;
  }
};

const isLValue = (context: CheckContext, expression: Ast.Expression) => {
  if (expression.ast === Ast.disc.Identifier) return true;
  if (
    expression.ast === Ast.disc.TupleExpression &&
    expression.elements.every((e) => isLValue(context, e))
  ) {
    return true;
  }

  return false;
};
