import { expect, test } from "bun:test";
import path from "node:path";
import { NotImplementedError } from "./errors/notImplemented.js";
import { tokenize } from "./lexer.js";
import {
  parse,
  parseContractDefinition,
  parseErrorDefinition,
  parseEventDefinition,
  parseExpression,
  parseFunctionDefinition,
  parseStatement,
} from "./parser.js";
import { Ast } from "./types/ast.js";
import { Token } from "./types/token.js";
import { never } from "./utils/never.js";

const assignmentOperatorToString = (operator: Ast.Assignment["operator"]): string => {
  switch (operator.token) {
    case Token.TokenType.Assign:
      return "=";
    case Token.TokenType.AddAssign:
      return "+=";
    case Token.TokenType.SubtractAssign:
      return "-=";
    case Token.TokenType.MulAssign:
      return "*=";
    case Token.TokenType.DivideAssign:
      return "/=";
    case Token.TokenType.ModuloAssign:
      return "%=";
    case Token.TokenType.BitwiseAndAssign:
      return "&=";
    case Token.TokenType.BitwiseOrAssign:
      return "|=";
    case Token.TokenType.BitwiseXOrAssign:
      return "^=";
    case Token.TokenType.ShiftRightAssign:
      return ">>=";
    case Token.TokenType.ShiftLeftAssign:
      return "<<=";
  }
};
const unaryOperatorToString = (operator: Ast.UnaryOperation["operator"]): string => {
  switch (operator.token) {
    case Token.TokenType.Increment:
      return "++";
    case Token.TokenType.Decrement:
      return "--";
    case Token.TokenType.Subtract:
      return "-";
    case Token.TokenType.Delete:
      return "delete";
    case Token.TokenType.Not:
      return "!";
    case Token.TokenType.BitwiseNot:
      return "~";
  }
};

const binaryOperatorToString = (operator: Ast.BinaryOperation["operator"]): string => {
  switch (operator.token) {
    case Token.TokenType.Add:
      return "+";
    case Token.TokenType.Subtract:
      return "-";
    case Token.TokenType.Mul:
      return "*";
    case Token.TokenType.Divide:
      return "/";
    case Token.TokenType.Modulo:
      return "%";
    case Token.TokenType.Power:
      return "**";
    case Token.TokenType.And:
      return "&&";
    case Token.TokenType.Or:
      return "||";
    case Token.TokenType.Equal:
      return "==";
    case Token.TokenType.NotEqual:
      return "!=";
    case Token.TokenType.Less:
      return "<";
    case Token.TokenType.LessEqual:
      return "<=";
    case Token.TokenType.More:
      return ">";
    case Token.TokenType.MoreEqual:
      return ">=";
    case Token.TokenType.BitwiseAnd:
      return "&";
    case Token.TokenType.BitwiseOr:
      return "|";
    case Token.TokenType.BitwiseXOr:
      return "^";
    case Token.TokenType.ShiftRight:
      return ">>";
    case Token.TokenType.ShiftLeft:
      return "<<";

    default:
      never(operator);
      return "";
  }
};

/** converts an expression to a polish notation string */
const expressionToString = (expression: Ast.Expression): string => {
  switch (expression.ast) {
    case Ast.AstType.Literal:
    case Ast.AstType.Identifier:
      return expression.token.value;

    case Ast.AstType.Assignment:
      return `(${assignmentOperatorToString(expression.operator)} ${expressionToString(expression.left)} ${expressionToString(expression.right)})`;

    case Ast.AstType.UnaryOperation:
      return expression.prefix
        ? `(${unaryOperatorToString(expression.operator)} ${expressionToString(expression.expression)})`
        : `(${expressionToString(expression.expression)} ${unaryOperatorToString(expression.operator)})`;

    case Ast.AstType.BinaryOperation:
      return `(${binaryOperatorToString(expression.operator)} ${expressionToString(expression.left)} ${expressionToString(expression.right)})`;

    case Ast.AstType.ConditionalExpression:
      return `(? ${expressionToString(expression.condition)} ${expressionToString(expression.trueExpression)} ${expressionToString(expression.falseExpression)})`;

    case Ast.AstType.MemberAccessExpression:
      return `(. ${expressionToString(expression.expression)} ${expressionToString(expression.member)})`;

    default:
      throw new NotImplementedError({ source: "expressionToString" });
  }
};

// expressions

test("identifier", () => {
  const identifier = parseExpression({
    tokens: tokenize("id"),
    tokenIndex: 0,
  }) as Ast.Identifier | undefined;

  expect(identifier!.ast).toBe(Ast.AstType.Identifier);
  expect(identifier!.token.value).toBe("id");
});

test("literal", () => {
  // const stringLiteral = parseExpression({
  //   tokens: tokenize(`"stringLiteral"`),
  //   tokenIndex: 0,
  // }) as Ast.Literal | undefined;
  // const addressLiteral = parseExpression({
  //   tokens: tokenize("0x0000000000000000000000000000"),
  //   tokenIndex: 0,
  // }) as Ast.Literal | undefined;
  // const hexLiteral = parseExpression({ tokens: tokenize(`hex"0x0"`), tokenIndex: 0 }) as
  //   | Ast.Literal
  //   | undefined;
  const numberLiteral = parseExpression({ tokens: tokenize("52"), tokenIndex: 0 }) as
    | Ast.Literal
    | undefined;
  // const rationalNumberLiteral = parseExpression({ tokens: tokenize("52.0"), tokenIndex: 0 }) as
  //   | Ast.Literal
  //   | undefined;
  // TODO(kyle): hexNumberLiteral
  const boolLiteral = parseExpression({ tokens: tokenize("true"), tokenIndex: 0 }) as
    | Ast.Literal
    | undefined;

  // expect(stringLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(addressLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(hexLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(numberLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(rationalNumberLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(boolLiteral!.ast).toBe(Ast.AstType.Literal);
});

test("assignment", () => {
  const assign = parseExpression({ tokens: tokenize("a = b"), tokenIndex: 0 });
  const addAssign = parseExpression({ tokens: tokenize("a += b"), tokenIndex: 0 });
  const subtractAssign = parseExpression({ tokens: tokenize("a -= b"), tokenIndex: 0 });
  const mulAssign = parseExpression({ tokens: tokenize("a *= b"), tokenIndex: 0 });
  const divideAssign = parseExpression({ tokens: tokenize("a /= b"), tokenIndex: 0 });
  const moduloAssign = parseExpression({ tokens: tokenize("a %= b"), tokenIndex: 0 });
  const bitwiseAndAssign = parseExpression({ tokens: tokenize("a &= b"), tokenIndex: 0 });
  const bitwiseOrAssign = parseExpression({ tokens: tokenize("a |= b"), tokenIndex: 0 });
  const bitwiseXOrAssign = parseExpression({ tokens: tokenize("a ^= b"), tokenIndex: 0 });
  const shiftRightAssign = parseExpression({ tokens: tokenize("a >>= b"), tokenIndex: 0 });
  const shiftLeftAssign = parseExpression({ tokens: tokenize("a <<= b"), tokenIndex: 0 });

  expect(assign!.ast).toBe(Ast.AstType.Assignment);
  expect(addAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(subtractAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(mulAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(divideAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(moduloAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(bitwiseAndAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(bitwiseOrAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(bitwiseXOrAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(shiftRightAssign!.ast).toBe(Ast.AstType.Assignment);
  expect(shiftLeftAssign!.ast).toBe(Ast.AstType.Assignment);
});

test("unary operation", () => {
  const incrementPostfix = parseExpression({ tokens: tokenize("id++"), tokenIndex: 0 });
  const decrementPostfix = parseExpression({ tokens: tokenize("id--"), tokenIndex: 0 });
  const incrementPrefix = parseExpression({ tokens: tokenize("++id"), tokenIndex: 0 });
  const decrementPrefix = parseExpression({ tokens: tokenize("--id"), tokenIndex: 0 });
  const subtract = parseExpression({ tokens: tokenize("-id"), tokenIndex: 0 });
  const _delete = parseExpression({ tokens: tokenize("delete id"), tokenIndex: 0 });
  const not = parseExpression({ tokens: tokenize("!id"), tokenIndex: 0 });
  const bitwiseNot = parseExpression({ tokens: tokenize("~id"), tokenIndex: 0 });

  expect(incrementPostfix!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(decrementPostfix!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(incrementPrefix!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(decrementPrefix!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(subtract!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(_delete!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(not!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(bitwiseNot!.ast).toBe(Ast.AstType.UnaryOperation);
});

test("binary operation", () => {
  const add = parseExpression({ tokens: tokenize("a + b"), tokenIndex: 0 });
  const subtract = parseExpression({ tokens: tokenize("a - b"), tokenIndex: 0 });
  const mul = parseExpression({ tokens: tokenize("a * b"), tokenIndex: 0 });
  const divide = parseExpression({ tokens: tokenize("a / b"), tokenIndex: 0 });
  const modulo = parseExpression({ tokens: tokenize("a % b"), tokenIndex: 0 });
  const power = parseExpression({ tokens: tokenize("a ** b"), tokenIndex: 0 });
  const and = parseExpression({ tokens: tokenize("a && b"), tokenIndex: 0 });
  const or = parseExpression({ tokens: tokenize("a || b"), tokenIndex: 0 });
  const equal = parseExpression({ tokens: tokenize("a == b"), tokenIndex: 0 });
  const notEqual = parseExpression({ tokens: tokenize("a != b"), tokenIndex: 0 });
  const less = parseExpression({ tokens: tokenize("a < b"), tokenIndex: 0 });
  const lessEqual = parseExpression({ tokens: tokenize("a <= b"), tokenIndex: 0 });
  const more = parseExpression({ tokens: tokenize("a > b"), tokenIndex: 0 });
  const moreEqual = parseExpression({ tokens: tokenize("a >= b"), tokenIndex: 0 });
  const bitwiseAnd = parseExpression({ tokens: tokenize("a & b"), tokenIndex: 0 });
  const bitwiseOr = parseExpression({ tokens: tokenize("a | b"), tokenIndex: 0 });
  const bitwiseXOr = parseExpression({ tokens: tokenize("a ^ b"), tokenIndex: 0 });
  const shiftRight = parseExpression({ tokens: tokenize("a >> b"), tokenIndex: 0 });
  const shiftLeft = parseExpression({ tokens: tokenize("a << b"), tokenIndex: 0 });

  expect(add!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(subtract!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(mul!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(divide!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(modulo!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(power!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(and!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(or!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(equal!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(notEqual!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(less!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(lessEqual!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(more!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(moreEqual!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(bitwiseAnd!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(bitwiseOr!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(bitwiseXOr!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(shiftRight!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(shiftLeft!.ast).toBe(Ast.AstType.BinaryOperation);

  let expression: Ast.Expression;

  expression = parseExpression({ tokens: tokenize("a + b + c"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(+ (+ a b) c)");

  expression = parseExpression({ tokens: tokenize("a + b * c * d + e"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(+ (+ a (* (* b c) d)) e)");
});

test("conditional expression", () => {
  const conditional = parseExpression({ tokens: tokenize("a ? b : c"), tokenIndex: 0 });
  expect(conditional!.ast).toBe(Ast.AstType.ConditionalExpression);
});

test("function call expression", () => {
  const emptyFunction = parseExpression({ tokens: tokenize("fn()"), tokenIndex: 0 }) as
    | Ast.FunctionCallExpression
    | undefined;
  const singleFunction = parseExpression({ tokens: tokenize("fn(a)"), tokenIndex: 0 }) as
    | Ast.FunctionCallExpression
    | undefined;
  const manyFunction = parseExpression({ tokens: tokenize("fn(a,b,c)"), tokenIndex: 0 }) as
    | Ast.FunctionCallExpression
    | undefined;

  expect(emptyFunction!.ast).toBe(Ast.AstType.FunctionCallExpression);
  expect(singleFunction!.ast).toBe(Ast.AstType.FunctionCallExpression);
  expect(manyFunction!.ast).toBe(Ast.AstType.FunctionCallExpression);

  expect(emptyFunction!.expression.ast).toBe(Ast.AstType.Identifier);
  expect(singleFunction!.expression.ast).toBe(Ast.AstType.Identifier);
  expect(manyFunction!.expression.ast).toBe(Ast.AstType.Identifier);

  expect(emptyFunction!.arguments).toHaveLength(0);
  expect(singleFunction!.arguments).toHaveLength(1);
  expect(manyFunction!.arguments).toHaveLength(3);
});

test("member access expression", () => {
  const memberAccess = parseExpression({ tokens: tokenize("a.b"), tokenIndex: 0 }) as
    | Ast.MemberAccessExpression
    | undefined;
  expect(memberAccess!.ast).toBe(Ast.AstType.MemberAccessExpression);
  expect(memberAccess!.expression.ast).toBe(Ast.AstType.Identifier);
  expect(memberAccess!.member.ast).toBe(Ast.AstType.Identifier);

  const expression = parseExpression({ tokens: tokenize("a.b.c"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(. (. a b) c)");
});

test("index access expression", () => {
  const indexAccess = parseExpression({ tokens: tokenize("a[0]"), tokenIndex: 0 }) as
    | Ast.IndexAccessExpression
    | undefined;
  expect(indexAccess!.ast).toBe(Ast.AstType.IndexAccessExpression);
  expect(indexAccess!.base.ast).toBe(Ast.AstType.Identifier);
  expect(indexAccess!.index.ast).toBe(Ast.AstType.Literal);
});

test("new expression", () => {
  const _new = parseExpression({ tokens: tokenize("new Contract()"), tokenIndex: 0 });
  expect(_new!.ast).toBe(Ast.AstType.NewExpression);
});

test("tuple expression", () => {
  const tuple = parseExpression({ tokens: tokenize("(a,b,c)"), tokenIndex: 0 }) as
    | Ast.TupleExpression
    | undefined;
  expect(tuple!.ast).toBe(Ast.AstType.TupleExpression);
  expect(tuple!.elements).toHaveLength(3);
});

// statements

test("expression statement", () => {
  const identifier = parseStatement({ tokens: tokenize("a;"), tokenIndex: 0 });
  const literal = parseStatement({ tokens: tokenize("52;"), tokenIndex: 0 });
  const assignment = parseStatement({ tokens: tokenize("a = 52;"), tokenIndex: 0 });
  const unaryOperation = parseStatement({
    tokens: tokenize("delete a;"),
    tokenIndex: 0,
  });
  const binaryOperation = parseStatement({
    tokens: tokenize("a + b;"),
    tokenIndex: 0,
  });
  const conditional = parseStatement({
    tokens: tokenize("a ? b : c;"),
    tokenIndex: 0,
  });
  const functionCall = parseStatement({
    tokens: tokenize("a();"),
    tokenIndex: 0,
  });
  const memberAccess = parseStatement({ tokens: tokenize("a.b;"), tokenIndex: 0 });
  const indexAccess = parseStatement({ tokens: tokenize("a[52];"), tokenIndex: 0 });
  const _new = parseStatement({
    tokens: tokenize("new a();"),
    tokenIndex: 0,
  });
  const tuple = parseStatement({
    tokens: tokenize("(a,b);"),
    tokenIndex: 0,
  });
  const parenthesized = parseStatement({
    tokens: tokenize("(((a + b)));"),
    tokenIndex: 0,
  });

  expect(identifier!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(literal!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(assignment!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(unaryOperation!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(binaryOperation!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(conditional!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(functionCall!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(memberAccess!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(indexAccess!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(_new!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(tuple!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(parenthesized!.ast).toBe(Ast.AstType.ExpressionStatement);
});

test("block statement", () => {
  const emptyBlock = parseStatement({
    tokens: tokenize("{}"),
    tokenIndex: 0,
  }) as Ast.BlockStatement;
  const singleBlock = parseStatement({
    tokens: tokenize("{a;}"),
    tokenIndex: 0,
  }) as Ast.BlockStatement;
  const manyBlock = parseStatement({
    tokens: tokenize("{a; b;}"),
    tokenIndex: 0,
  }) as Ast.BlockStatement;

  expect(emptyBlock!.ast).toBe(Ast.AstType.BlockStatement);
  expect(singleBlock!.ast).toBe(Ast.AstType.BlockStatement);
  expect(manyBlock!.ast).toBe(Ast.AstType.BlockStatement);

  expect(emptyBlock!.statements).toHaveLength(0);
  expect(manyBlock!.statements).toHaveLength(2);
  expect(singleBlock!.statements).toHaveLength(1);
});

test("unchecked block statement", () => {
  const emptyBlock = parseStatement({
    tokens: tokenize("unchecked {}"),
    tokenIndex: 0,
  }) as Ast.UncheckedBlockStatement;
  const singleBlock = parseStatement({
    tokens: tokenize("unchecked {a;}"),
    tokenIndex: 0,
  }) as Ast.UncheckedBlockStatement;
  const manyBlock = parseStatement({
    tokens: tokenize("unchecked { a; b; }"),
    tokenIndex: 0,
  }) as Ast.UncheckedBlockStatement;

  expect(emptyBlock!.ast).toBe(Ast.AstType.UncheckedBlockStatement);
  expect(singleBlock!.ast).toBe(Ast.AstType.UncheckedBlockStatement);
  expect(manyBlock!.ast).toBe(Ast.AstType.UncheckedBlockStatement);

  expect(emptyBlock!.statements).toHaveLength(0);
  expect(singleBlock!.statements).toHaveLength(1);
  expect(manyBlock!.statements).toHaveLength(2);
});

test.todo("if statement", () => {
  const _if = parseStatement({ tokens: tokenize("if (a) { b; }"), tokenIndex: 0 });
  const _ifElse = parseStatement({
    tokens: tokenize("if (a) { b; } else { c; }"),
    tokenIndex: 0,
  });

  expect(_if!.ast).toBe(Ast.AstType.IfStatement);
  expect(_ifElse!.ast).toBe(Ast.AstType.IfStatement);
});

test.todo("for statement", () => {});

test.todo("while statement", () => {
  const _while = parseStatement({ tokens: tokenize("while (a) { b; }"), tokenIndex: 0 });
  expect(_while!.ast).toBe(Ast.AstType.WhileStatement);
});

test.todo("do while statement");

test("break statement", () => {
  const _break = parseStatement({ tokens: tokenize("break;"), tokenIndex: 0 });
  expect(_break!.ast).toBe(Ast.AstType.BreakStatement);
});

test("continue statement", () => {
  const _continue = parseStatement({ tokens: tokenize("continue;"), tokenIndex: 0 });
  expect(_continue!.ast).toBe(Ast.AstType.ContinueStatement);
});

test("emit statement", () => {
  const emit = parseStatement({ tokens: tokenize("emit Log();"), tokenIndex: 0 });
  expect(emit!.ast).toBe(Ast.AstType.EmitStatement);
});

test("revert statement", () => {
  const revert = parseStatement({ tokens: tokenize("revert Error();"), tokenIndex: 0 });
  expect(revert!.ast).toBe(Ast.AstType.RevertStatement);
});

test("return statement", () => {
  const _return = parseStatement({ tokens: tokenize("return;"), tokenIndex: 0 });
  const _returnExpression = parseStatement({
    tokens: tokenize("return a;"),
    tokenIndex: 0,
  });

  expect(_return!.ast).toBe(Ast.AstType.ReturnStatement);
  expect(_returnExpression!.ast).toBe(Ast.AstType.ReturnStatement);
});

test.todo("placehoder statement", () => {
  const placeholder = parseStatement({ tokens: tokenize("_;"), tokenIndex: 0 });
  expect(placeholder!.ast).toBe(Ast.AstType.PlaceholderStatement);
});

test("variable declaration", () => {
  const noInitializer = parseStatement({
    tokens: tokenize("uint256 a;"),
    tokenIndex: 0,
  }) as Ast.VariableDeclaration | undefined;
  const initializer = parseStatement({
    tokens: tokenize("uint256 a = 0;"),
    tokenIndex: 0,
  }) as Ast.VariableDeclaration | undefined;
  const location = parseStatement({
    tokens: tokenize("uint256 memory a;"),
    tokenIndex: 0,
  }) as Ast.VariableDeclaration | undefined;

  // TODO(kyle) attributes

  expect(noInitializer!.ast).toBe(Ast.AstType.VariableDeclaration);
  expect(initializer!.ast).toBe(Ast.AstType.VariableDeclaration);
  expect(location!.ast).toBe(Ast.AstType.VariableDeclaration);

  expect(initializer!.initializer).toBeDefined();
});

test("event definition", () => {
  const event = parseEventDefinition({ tokens: tokenize("event Event();"), tokenIndex: 0 });
  expect(event.ast).toBe(Ast.AstType.EventDefinition);
});

test("error definition", () => {
  const error = parseErrorDefinition({ tokens: tokenize("error Error();"), tokenIndex: 0 });
  expect(error.ast).toBe(Ast.AstType.ErrorDefinition);
});

test("contract definition", () => {
  parseContractDefinition({ tokens: tokenize("contract C {}"), tokenIndex: 0 });
});

test("function definition", () => {
  parseFunctionDefinition({ tokens: tokenize("function fn() external {}"), tokenIndex: 0 });
  parseFunctionDefinition({ tokens: tokenize("function fn() external view {}"), tokenIndex: 0 });
  parseFunctionDefinition({ tokens: tokenize("function fn() view external {}"), tokenIndex: 0 });
  parseFunctionDefinition({
    tokens: tokenize("function fn(uint256 a) external {}"),
    tokenIndex: 0,
  });
});

test.todo("struct definition");

test.todo("modifier definition");

test("integration", async () => {
  parse(tokenize(await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text()));
  // tokenize(await Bun.file(path.join(import.meta.dir, "_sol", "Erc20.sol")).text());
});
