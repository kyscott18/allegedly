import { NotImplementedError } from "./errors/notImplemented";
import { TypeError } from "./errors/type";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import { never } from "./utils/never";

export type CheckContext = {
  symbols: Map<string, Type>[];
  isContractScope: boolean;
};

type ElementaryType = {
  _type: "elementary";
  type: Ast.ElementaryType["type"];
  isLiteral?: boolean;
};

type FunctionType = {
  _type: "function";
  parameterTypes: Type[];
  returnTypes: Type[];
  isConversion: boolean;
};

type ContractType = {
  _type: "contract";
  functions: [string, FunctionType][];
};

type StructType = {
  _type: "struct";
  members: Map<string, ElementaryType | FunctionType>;
};

type TupleType = {
  _type: "tuple";
  elements: Type[];
};

export type Type = ElementaryType | FunctionType | ContractType | StructType | TupleType;

/** Convert `Ast.Type` to internal representation */
const toType = (type: Ast.Type): Type => {
  return { _type: "elementary", type: (type as Ast.ElementaryType).type, isLiteral: false };
};

const unwrap = (type: Type): Type => {
  if (type._type === "tuple" && type.elements.length === 1) return type.elements[0]!;
  return type;
};

const isEqual = (a: Type, _b: Type): boolean => {
  if (a._type !== _b._type) return false;

  if (a._type === "elementary") {
    const b = _b as Extract<Type, { _type: "elementary" }>;

    switch (a.type.token) {
      case Token.TokenType.Address:
      case Token.TokenType.String:
      case Token.TokenType.Bytes:
      case Token.TokenType.Bool:
        return a.type.token === b.type.token;

      case Token.TokenType.Uint:
      case Token.TokenType.Int:
      case Token.TokenType.Byte:
        return a.type.token === b.type.token && a.type.size === b.type.size;
    }
  }

  return false;
};

export const check = (program: Ast.Program): CheckContext["symbols"] => {
  const context: CheckContext = {
    symbols: [
      new Map([
        [
          "block",
          {
            _type: "struct",
            members: new Map([
              [
                "basefee",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              [
                "blobbasefee",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              [
                "chainid",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              ["coinbase", { _type: "elementary", type: { token: Token.TokenType.Address } }],
              [
                "difficulty",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              [
                "gaslimit",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              ["number", { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } }],
              [
                "prevrandao",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              [
                "timestamp",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
            ]),
          },
        ],
        [
          "msg",
          {
            _type: "struct",
            members: new Map([
              ["data", { _type: "elementary", type: { token: Token.TokenType.Bytes } }],
              ["sender", { _type: "elementary", type: { token: Token.TokenType.Address } }],
              ["sig", { _type: "elementary", type: { token: Token.TokenType.Byte, size: 4 } }],
              ["value", { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } }],
            ]),
          },
        ],
        [
          "tx",
          {
            _type: "struct",
            members: new Map([
              [
                "gasprice",
                { _type: "elementary", type: { token: Token.TokenType.Uint, size: 256 } },
              ],
              ["origin", { _type: "elementary", type: { token: Token.TokenType.Address } }],
            ]),
          },
        ],
      ]),
    ],
    isContractScope: false,
  };

  for (const definition of program) {
    checkDefinition(context, definition);
  }

  return context.symbols;
};

const addSymbol = (context: CheckContext, symbol: string, type: Type) => {
  const scope = context.symbols[context.symbols.length - 1]!;

  if (scope.has(symbol)) {
    throw new TypeError("Identifier already declared", 2333);
  }

  scope.set(symbol, type);
};

const resolveSymbol = (context: CheckContext, symbol: string): Type => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    // TODO(kyle)
    if (scope?.has(symbol)) return scope.get(symbol)! as Type;
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
    case Ast.AstType.VariableDefinition:
      // TODO
      break;

    case Ast.AstType.FunctionDefinition:
      if (definition.body !== undefined) checkStatement(context, definition.body);
      break;

    case Ast.AstType.ContractDefinition:
      context.isContractScope = true;
      for (const _definition of definition.nodes) {
        checkDefinition(context, _definition);
      }
      context.isContractScope = false;
      addSymbol(context, definition.name.value, {
        _type: "contract",
        functions: definition.nodes
          .filter(
            (node): node is Ast.FunctionDefinition => node.ast === Ast.AstType.FunctionDefinition,
          )
          .map((node) => [
            node.name!.value,
            {
              _type: "function",
              parameterTypes: node.parameters.map((param) => toType(param.type)),
              returnTypes: node.returns.map((param) => toType(param.type)),
              isConversion: false,
            },
          ]),
      });
      break;

    case Ast.AstType.EventDefinition:
      // TODO
      break;

    case Ast.AstType.ErrorDefinition:
      // TODO
      break;

    case Ast.AstType.StructDefinition:
      // TODO
      break;

    case Ast.AstType.ModifierDefinition:
      // TODO
      break;

    default:
      never(definition);
  }
};

export const checkStatement = (context: CheckContext, statement: Ast.Statement): void => {
  switch (statement.ast) {
    case Ast.AstType.VariableDeclaration:
      addSymbol(context, statement.identifier.value, toType(statement.type));
      if (statement.initializer) {
        const initializer = checkExpression(context, statement.initializer);
        if (isImplicitlyConvertibleTo(initializer, toType(statement.type)) === false) {
          throw new TypeError(
            `Type ${initializer} is not implicitly convertible to expected type ${statement.type}`,
            9574,
          );
        }
      }
      break;

    case Ast.AstType.ExpressionStatement:
      checkExpression(context, statement.expression);
      break;

    case Ast.AstType.BlockStatement:
      enterScope(context);
      for (const _statement of statement.statements) {
        checkStatement(context, _statement);
      }
      exitScope(context);
      break;

    case Ast.AstType.UncheckedBlockStatement:
      enterScope(context);
      for (const _statement of statement.statements) {
        checkStatement(context, _statement);
      }
      exitScope(context);
      break;

    case Ast.AstType.IfStatement:
    case Ast.AstType.ForStatement:
    case Ast.AstType.WhileStatement:
    case Ast.AstType.DoWhileStatement:
    case Ast.AstType.BreakStatement:
    case Ast.AstType.ContinueStatement:
    case Ast.AstType.EmitStatement:
    case Ast.AstType.RevertStatement:
    case Ast.AstType.ReturnStatement:
    case Ast.AstType.PlaceholderStatement:
      break;

    default:
      never(statement);
  }
};

export const checkExpression = (context: CheckContext, expression: Ast.Expression): Type => {
  switch (expression.ast) {
    case Ast.AstType.Identifier:
      if (expression.token.token === Token.TokenType.Identifier) {
        const symbol = resolveSymbol(context, expression.token.value);

        // TODO(kyle) handle native conversions better

        if (symbol._type === "contract") {
          return {
            _type: "function",
            parameterTypes: [symbol],
            returnTypes: [symbol],
            isConversion: true,
          };
        }
        return symbol;
      }

      return {
        _type: "function",
        parameterTypes: [{ _type: "elementary", type: expression.token }],
        returnTypes: [{ _type: "elementary", type: expression.token }],
        isConversion: true,
      };

    case Ast.AstType.Literal:
      switch (expression.token.token) {
        case Token.TokenType.AddressLiteral:
          return { _type: "elementary", type: { token: Token.TokenType.Address }, isLiteral: true };

        case Token.TokenType.StringLiteral:
          return { _type: "elementary", type: { token: Token.TokenType.String }, isLiteral: true };

        case Token.TokenType.HexLiteral:
          return { _type: "elementary", type: { token: Token.TokenType.Bytes }, isLiteral: true };

        case Token.TokenType.NumberLiteral:
          return {
            _type: "elementary",
            type: { token: Token.TokenType.Uint, size: 256 },
            isLiteral: true,
          };

        case Token.TokenType.RationalNumberLiteral:
          return {
            _type: "elementary",
            type: { token: Token.TokenType.Uint, size: 256 },
            isLiteral: true,
          };

        case Token.TokenType.HexNumberLiteral:
          return {
            _type: "elementary",
            type: { token: Token.TokenType.Uint, size: 256 },
            isLiteral: true,
          };

        case Token.TokenType.BoolLiteral:
          return { _type: "elementary", type: { token: Token.TokenType.Bool }, isLiteral: true };

        default:
          never(expression.token);
      }
      break;

    case Ast.AstType.Assignment: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);

      if (isImplicitlyConvertibleTo(left, right) === false) {
        throw new TypeError(
          `Type ${left} is not implicitly convertible to expected type ${right}`,
          7407,
        );
      }

      return checkExpression(context, expression.right);
    }

    case Ast.AstType.UnaryOperation:
      {
        const _expression = checkExpression(context, expression.expression);

        switch (expression.operator.token) {
          case Token.TokenType.Increment:
          case Token.TokenType.Decrement:
            break;

          case Token.TokenType.Subtract:
            if (
              _expression._type !== "elementary" ||
              _expression.type.token !== Token.TokenType.Int
            ) {
              throw new TypeError(
                `Built-in unary operator ${expression.operator} cannot be applied to type ${_expression}`,
                4907,
              );
            }
            break;

          case Token.TokenType.Delete:
          case Token.TokenType.Not:
          case Token.TokenType.BitwiseNot:
            break;
        }
      }
      break;

    case Ast.AstType.BinaryOperation: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);

      if (isImplicitlyConvertibleTo(left, right) === false)
        throw new TypeError(
          `Built-in binary operator ${expression.operator.token} cannot be applied to types ${left} and ${right}`,
          2271,
        );

      return right;
    }

    case Ast.AstType.ConditionalExpression: {
      const condition = checkExpression(context, expression.condition);
      const trueExpression = checkExpression(context, expression.trueExpression);
      const falseExpression = checkExpression(context, expression.falseExpression);

      if (
        isImplicitlyConvertibleTo(condition, {
          _type: "elementary",
          type: { token: Token.TokenType.Bool },
          isLiteral: false,
        }) === false
      )
        throw new Error("bad!");
      if (isImplicitlyConvertibleTo(trueExpression, falseExpression) === false)
        throw new Error("bad!");

      return trueExpression;
    }

    case Ast.AstType.FunctionCallExpression: {
      const _expression = checkExpression(context, expression.expression);

      if (_expression._type === "function") {
        if (_expression.parameterTypes.length !== expression.arguments.length) {
          throw new TypeError(
            `Wrong argument count for function call: ${expression.arguments.length} arguments given but expected ${_expression.parameterTypes.length}.`,
            6160,
          );
        }

        for (let i = 0; i < expression.arguments.length; i++) {
          const _argument = checkExpression(context, expression.arguments[i]!);

          if (_expression.isConversion) {
            if (isExplicitlyConvertibleTo(_argument, _expression.returnTypes[0]!) === false) {
              throw new TypeError(
                `Explicit type conversion is not allowed from "${_argument}" to "${_expression.returnTypes[0]!}".`,
                9640,
              );
            }
          } else {
            if (isImplicitlyConvertibleTo(_argument, _expression.parameterTypes[i]!) === false) {
              throw new TypeError(
                `Invalid type for argument in function call. Invalid implicit conversion from ${_argument} to ${_expression.parameterTypes[i]!} requested.`,
                9553,
              );
            }
          }
        }

        return unwrap({ _type: "tuple", elements: _expression.returnTypes });
      }

      throw new TypeError("This expression is not callable", 5704);
    }

    case Ast.AstType.MemberAccessExpression: {
      const _expression = checkExpression(context, expression.expression);

      if (expression.member.token.token !== Token.TokenType.Identifier) {
        throw new TypeError(`Expected identifer but got ${expression.member.token}`, 2314);
      }

      if (_expression._type === "contract") {
        // TODO(kyle) fn overloading
        // @ts-ignore
        return _expression.functions.find((fn) => fn[0] === expression.member.token.value)![1];
      }

      if (_expression._type === "struct") {
        if (_expression.members.has(expression.member.token.value)) {
          return _expression.members.get(expression.member.token.value)!;
        }
      }

      throw new TypeError(
        `Member "${expression.member.token.value}" not found or not visible after argument-dependent lookup in ${_expression}`,
        9582,
      );
    }

    case Ast.AstType.IndexAccessExpression:
      throw new NotImplementedError({ source: "a[i]" });

    case Ast.AstType.NewExpression:
      throw new NotImplementedError({ source: "new A()" });

    case Ast.AstType.TupleExpression:
      throw new NotImplementedError({ source: "a[i]" });

    default:
      never(expression);
  }

  throw "unreachable";
};

const isExplicitlyConvertibleTo = (from: Type, to: Type): boolean => {
  if (isImplicitlyConvertibleTo(from, to)) return true;

  if (from._type === "elementary" && to._type === "elementary") {
    if (from.type.token === to.type.token) return true;

    // integer to integer
    if (
      (from.type.token === Token.TokenType.Uint &&
        to.type.token === Token.TokenType.Int &&
        from.type.size === to.type.size) ||
      (from.type.token === Token.TokenType.Int &&
        to.type.token === Token.TokenType.Uint &&
        from.type.size === to.type.size)
    ) {
      return true;
    }

    // integer to address
    if (
      from.type.token === Token.TokenType.Uint &&
      to.type.token === Token.TokenType.Address &&
      from.type.size === 160
    ) {
      return true;
    }

    // address to integer
    if (
      from.type.token === Token.TokenType.Address &&
      to.type.token === Token.TokenType.Uint &&
      to.type.size === 160
    ) {
      return true;
    }

    // integer to fixed bytes
    if (
      from.type.token === Token.TokenType.Uint &&
      to.type.token === Token.TokenType.Byte &&
      from.type.size === to.type.size * 8
    ) {
      return true;
    }

    // fixed bytes to integer
    if (
      from.type.token === Token.TokenType.Byte &&
      to.type.token === Token.TokenType.Uint &&
      from.type.size * 8 === to.type.size
    ) {
      return true;
    }

    // fixed bytes to address
    if (
      from.type.token === Token.TokenType.Byte &&
      to.type.token === Token.TokenType.Address &&
      from.type.size === 20
    ) {
      return true;
    }

    // address to fixed bytes
    if (
      from.type.token === Token.TokenType.Address &&
      to.type.token === Token.TokenType.Byte &&
      to.type.size === 20
    ) {
      return true;
    }

    return false;
  }

  // address to contract
  if (
    from._type === "elementary" &&
    to._type === "contract" &&
    from.type.token === Token.TokenType.Address
  ) {
    return true;
  }

  // contract to address
  if (
    from._type === "contract" &&
    to._type === "elementary" &&
    to.type.token === Token.TokenType.Address
  ) {
    return true;
  }

  return false;
};

const isImplicitlyConvertibleTo = (from: Type, _to: Type): boolean => {
  if (isEqual(from, _to)) return true;
  if (from._type !== _to._type) return false;

  if (from._type === "elementary") {
    const to = _to as Extract<Type, { _type: "elementary" }>;

    // integer to integer
    if (
      (from.type.token === Token.TokenType.Uint &&
        to.type.token === Token.TokenType.Uint &&
        from.type.size <= to.type.size) ||
      (from.type.token === Token.TokenType.Int &&
        to.type.token === Token.TokenType.Int &&
        from.type.size <= to.type.size)
    ) {
      return true;
    }

    // integer literal
    if (
      from.type.token === Token.TokenType.Uint &&
      from.isLiteral &&
      (to.type.token === Token.TokenType.Uint || to.type.token === Token.TokenType.Int)
    ) {
      return true;
    }

    // fixed bytes to fixed bytes
    if (
      from.type.token === Token.TokenType.Byte &&
      to.type.token === Token.TokenType.Byte &&
      from.type.size <= to.type.size
    ) {
      return true;
    }
  }
  return false;
};
