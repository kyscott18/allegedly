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
  annotations: Map<Ast.Expression, Type.Type>;
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

export const check = (source: string, program: Ast.Program): TypeAnnotations => {
  const context: CheckContext = {
    source,
    symbols: [
      new Map([
        [
          "block",
          {
            type: Type.disc.Struct,
            members: new Map<string, Type.Type>([
              ["basefee", Type.staticUint256],
              ["blobbasefee", Type.staticUint256],
              ["chainid", Type.staticUint256],
              ["coinbase", Type.staticAddress],
              ["difficulty", Type.staticUint256],
              ["gaslimit", Type.staticUint256],
              ["number", Type.staticUint256],
              ["prevrandao", Type.staticUint256],
              ["timestamp", Type.staticUint256],
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
              ["sig", Type.staticBytes4],
              ["value", Type.staticUint256],
            ]),
          },
        ],
        [
          "tx",
          {
            type: Type.disc.Struct,
            members: new Map<string, Type.Type>([
              ["gasprice", Type.staticUint256],
              ["origin", Type.staticAddress],
            ]),
          },
        ],
      ]),
    ],
    annotations: new Map(),
    isContractScope: false,
  };

  for (const definition of program) {
    checkDefinition(context, definition);
  }

  return context.annotations;
};

const addSymbol = (context: CheckContext, symbol: string, type: Type.Type) => {
  const scope = context.symbols[context.symbols.length - 1]!;

  if (scope.has(symbol)) {
    throw new TypeError("Identifier already declared", 2333);
  }

  scope.set(symbol, type);
};

const resolveSymbol = (context: CheckContext, symbol: string): Type.Type => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    if (scope?.has(symbol)) return scope.get(symbol)!;
  }

  throw new TypeError("Undeclared identifier", 7576);
};

const enterScope = (context: CheckContext) => {
  context.symbols.push(new Map());
};

const exitScope = (context: CheckContext) => {
  context.symbols.pop();
};

export const checkDefinition = (context: CheckContext, definition: Ast.Definition): void => {
  switch (definition.ast) {
    case Ast.disc.VariableDefinition:
      throw new NotImplementedError({
        source: context.source,
        loc: definition.loc,
        feature: "variable defintion",
      });

    case Ast.disc.FunctionDefinition:
      if (definition.body !== undefined) checkStatement(context, definition.body);
      break;

    case Ast.disc.ContractDefinition:
      context.isContractScope = true;
      for (const _definition of definition.nodes) {
        checkDefinition(context, _definition);
      }
      context.isContractScope = false;
      addSymbol(context, definition.name.value, Type.convertAst(definition));
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
      addSymbol(context, statement.identifier.value, Type.convertAst(statement.type));
      if (statement.initializer) {
        const initializer = checkExpression(context, statement.initializer);
        context.annotations.set(statement.initializer, initializer);
        if (isImplicitlyConvertibleTo(initializer, Type.convertAst(statement.type)) === false) {
          throw new TypeError(
            `Type ${initializer} is not implicitly convertible to expected type ${statement.type}`,
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
    case Ast.disc.Identifier:
      if (expression.token.token === Token.disc.Identifier) {
        const symbol = resolveSymbol(context, expression.token.value);

        if (symbol.type === Type.disc.Contract) {
          return {
            type: Type.disc.Function,
            parameters: [symbol],
            returns: [symbol],
            isTypeConversion: true,
          };
        }
        return symbol;
      }

      // TODO(kyle) handle native conversions better

      return {
        type: Type.disc.Function,
        parameters: [{ type: Type.disc.Elementary, value: expression.token, isLiteral: false }],
        returns: [{ type: Type.disc.Elementary, value: expression.token, isLiteral: false }],
        isTypeConversion: true,
      };

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

        case Token.disc.RationalNumberLiteral:
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

      if (isImplicitlyConvertibleTo(left, right) === false) {
        throw new TypeError(
          `Type ${left} is not implicitly convertible to expected type ${right}`,
          7407,
        );
      }

      return right;
    }

    case Ast.disc.UnaryOperation:
      {
        const _expression = checkExpression(context, expression.expression);
        context.annotations.set(expression.expression, _expression);

        switch (expression.operator.token) {
          case Token.disc.Increment:
          case Token.disc.Decrement:
            break;

          case Token.disc.Subtract:
            if (
              _expression.type !== Type.disc.Elementary ||
              _expression.value.token !== Token.disc.Int
            ) {
              throw new TypeError(
                `Built-in unary operator ${expression.operator} cannot be applied to type ${_expression}`,
                4907,
              );
            }
            break;

          case Token.disc.Delete:
          case Token.disc.Not:
          case Token.disc.BitwiseNot:
            break;
        }
      }
      break;

    case Ast.disc.BinaryOperation: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);
      context.annotations.set(expression.left, left);
      context.annotations.set(expression.right, right);

      if (isImplicitlyConvertibleTo(left, right) === false)
        throw new TypeError(
          `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
          2271,
        );

      return right;
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
      const _expression = checkExpression(context, expression.expression);
      context.annotations.set(expression.expression, _expression);

      if (_expression.type === Type.disc.Function) {
        if (_expression.parameters.length !== expression.arguments.length) {
          throw new TypeError(
            `Wrong argument count for function call: ${expression.arguments.length} arguments given but expected ${_expression.parameters.length}.`,
            6160,
          );
        }

        for (let i = 0; i < expression.arguments.length; i++) {
          const _argument = checkExpression(context, expression.arguments[i]!);
          context.annotations.set(expression.arguments[i]!, _argument);

          if (_expression.isTypeConversion) {
            if (isExplicitlyConvertibleTo(_argument, _expression.returns[0]!) === false) {
              throw new TypeError(
                `Explicit type conversion is not allowed from "${_argument}" to "${_expression.returns[0]!}".`,
                9640,
              );
            }
          } else {
            if (isImplicitlyConvertibleTo(_argument, _expression.parameters[i]!) === false) {
              throw new TypeError(
                `Invalid type for argument in function call. Invalid implicit conversion from ${_argument} to ${_expression.parameters[i]!} requested.`,
                9553,
              );
            }
          }
        }

        return Type.unwrap({ type: Type.disc.Tuple, elements: _expression.returns });
      }

      throw new TypeError("This expression is not callable", 5704);
    }

    case Ast.disc.MemberAccessExpression: {
      const _expression = checkExpression(context, expression.expression);
      context.annotations.set(expression.expression, _expression);

      if (expression.member.token.token !== Token.disc.Identifier) {
        throw new TypeError(`Expected identifer but got ${expression.member.token}`, 2314);
      }

      if (_expression.type === Type.disc.Contract) {
        // TODO(kyle) fn overloading
        // @ts-ignore
        return _expression.functions.find((fn) => fn[0] === expression.member.token.value)![1];
      }

      if (_expression.type === Type.disc.Struct) {
        if (_expression.members.has(expression.member.token.value)) {
          return _expression.members.get(expression.member.token.value)!;
        }
      }

      throw new TypeError(
        `Member "${expression.member.token.value}" not found or not visible after argument-dependent lookup in ${_expression}`,
        9582,
      );
    }

    case Ast.disc.IndexAccessExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: expression.loc,
        feature: "index access",
      });

    case Ast.disc.NewExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: expression.loc,
        feature: "contract creation",
      });

    case Ast.disc.TupleExpression:
      throw new NotImplementedError({
        source: context.source,
        loc: expression.loc,
        feature: "tuple",
      });

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
