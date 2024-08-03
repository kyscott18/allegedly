import { NotImplementedError } from "./errors/notImplemented";
import { TypeError } from "./errors/type";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import { never } from "./utils/never";

export type CheckContext = {
  symbols: Map<string, Type | Map<string, Type>>[];
};

type Type = Ast.ElementaryType["type"];

const isEqual = (a: Type, b: Type): boolean => {
  switch (a.token) {
    case Token.TokenType.Address:
    case Token.TokenType.String:
    case Token.TokenType.Bytes:
    case Token.TokenType.Bool:
      return a.token === b.token;

    case Token.TokenType.Uint:
    case Token.TokenType.Int:
    case Token.TokenType.Byte:
      return a.token === b.token && a.size === b.size;
  }
};

export const check = (program: Ast.Program): void => {
  const context: CheckContext = {
    symbols: [
      new Map([
        [
          "block",
          new Map([
            ["basefee", { token: Token.TokenType.Uint, size: 256 }],
            ["blobbasefee", { token: Token.TokenType.Uint, size: 256 }],
            ["chainid", { token: Token.TokenType.Uint, size: 256 }],
            ["coinbase", { token: Token.TokenType.Address }],
            ["difficulty", { token: Token.TokenType.Uint, size: 256 }],
            ["gaslimit", { token: Token.TokenType.Uint, size: 256 }],
            ["number", { token: Token.TokenType.Uint, size: 256 }],
            ["prevrandao", { token: Token.TokenType.Uint, size: 256 }],
            ["timestamp", { token: Token.TokenType.Uint, size: 256 }],
          ]),
        ],
        [
          "msg",
          new Map([
            ["data", { token: Token.TokenType.Bytes }],
            ["sender", { token: Token.TokenType.Address }],
            ["sig", { token: Token.TokenType.Byte, size: 4 }],
            ["value", { token: Token.TokenType.Uint, size: 256 }],
          ]),
        ],
        [
          "tx",
          new Map([
            ["gasprice", { token: Token.TokenType.Uint, size: 256 }],
            ["origin", { token: Token.TokenType.Address }],
          ]),
        ],
      ]),
    ],
  };

  for (const definition of program) {
    checkDefinition(context, definition);
  }
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
    case Ast.AstType.FunctionDefinition:
      checkStatement(context, definition.body);
      break;
  }
};

export const checkStatement = (context: CheckContext, statement: Ast.Statement): void => {
  switch (statement.ast) {
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
    case Ast.AstType.VariableDeclaration:
      addSymbol(context, statement.identifier.value, statement.type.type);
      if (statement.initializer) {
        const initializer = checkExpression(context, statement.initializer);
        if (isEqual(statement.type.type, initializer) === false) {
          throw new TypeError(
            `Type ${initializer} is not implicitly convertable to expected type ${statement.type}`,
            9574,
          );
        }
      }
      break;
  }
};

export const checkExpression = (context: CheckContext, expression: Ast.Expression): Type => {
  switch (expression.ast) {
    case Ast.AstType.Identifier:
      return resolveSymbol(context, expression.token.value);

    case Ast.AstType.Literal:
      switch (expression.token.token) {
        case Token.TokenType.AddressLiteral:
          return { token: Token.TokenType.Address };

        case Token.TokenType.StringLiteral:
          return { token: Token.TokenType.String };

        case Token.TokenType.HexLiteral:
          return { token: Token.TokenType.Bytes };

        case Token.TokenType.NumberLiteral:
          return { token: Token.TokenType.Uint, size: 256 };

        case Token.TokenType.RationalNumberLiteral:
          return { token: Token.TokenType.Uint, size: 256 };

        case Token.TokenType.HexNumberLiteral:
          return { token: Token.TokenType.Uint, size: 256 };

        case Token.TokenType.BoolLiteral:
          return { token: Token.TokenType.Bool };

        default:
          never(expression.token);
      }
      break;

    case Ast.AstType.Assignment: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);

      if (isEqual(left, right) === false) {
        throw new TypeError(
          `Type ${left} is not implicitly convertable to expected type ${right}`,
          7407,
        );
      }

      return checkExpression(context, expression.right);
    }

    case Ast.AstType.UnaryOperation:
      return checkExpression(context, expression.expression);

    case Ast.AstType.BinaryOperation: {
      const left = checkExpression(context, expression.left);
      const right = checkExpression(context, expression.right);

      if (isEqual(left, right) === false)
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

      if (isEqual(condition.token, Token.TokenType.Bool) === false) throw new Error("bad!");
      if (isEqual(trueExpression, falseExpression) === false) throw new Error("bad!");

      return trueExpression;
    }

    case Ast.AstType.FunctionCallExpression: {
      throw new NotImplementedError({ source: "f()" });
    }

    case Ast.AstType.MemberAccessExpression: {
      throw new NotImplementedError({ source: "a.i" });
    }

    case Ast.AstType.IndexAccessExpression: {
      throw new NotImplementedError({ source: "a[i]" });
    }

    case Ast.AstType.NewExpression: {
      throw new NotImplementedError({ source: "new A()" });
    }

    case Ast.AstType.TupleExpression: {
      throw new NotImplementedError({ source: "a[i]" });
    }

    default:
      never(expression);
  }

  throw "unreachable";
};
