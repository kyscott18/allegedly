import { expect, test } from "bun:test";
import { tokenize } from "./lexer.js";
import {
  tryParseAssignment,
  tryParseBinaryOperation,
  tryParseConditionalExpression,
  tryParseIdentifier,
  tryParseLiteral,
  tryParseTupleExpress,
  tryParseTupleExpression,
  tryParseUnaryOperation,
} from "./parser.js";
import { Ast } from "./types/ast.js";

test("identifier", () => {
  const identifier = tryParseIdentifier({ tokens: tokenize("id"), tokenIndex: 0 });

  expect(identifier).toBeDefined();
  expect(identifier!.ast).toBe(Ast.AstType.Identifier);
});

test("literal", () => {
  const stringLiteral = tryParseLiteral({ tokens: tokenize(`"stringLiteral"`), tokenIndex: 0 });
  const addressLiteral = tryParseLiteral({
    tokens: tokenize("0x0000000000000000000000000000"),
    tokenIndex: 0,
  });
  const hexLiteral = tryParseLiteral({
    tokens: tokenize(`hex"0x0"`),
    tokenIndex: 0,
  });
  const numberLiteral = tryParseLiteral({
    tokens: tokenize("52"),
    tokenIndex: 0,
  });
  const rationalNumberLiteral = tryParseLiteral({
    tokens: tokenize("52.0"),
    tokenIndex: 0,
  });
  // TODO(kyle): hexNumberLiteral
  const boolLiteral = tryParseLiteral({
    tokens: tokenize("true"),
    tokenIndex: 0,
  });

  expect(stringLiteral).toBeDefined();
  expect(addressLiteral).toBeDefined();
  expect(hexLiteral).toBeDefined();
  expect(numberLiteral).toBeDefined();
  expect(rationalNumberLiteral).toBeDefined();
  expect(boolLiteral).toBeDefined();

  expect(stringLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(addressLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(hexLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(numberLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(rationalNumberLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(boolLiteral!.ast).toBe(Ast.AstType.Literal);
});

test("assignment", () => {
  const assign = tryParseAssignment({ tokens: tokenize("a = b"), tokenIndex: 0 });
  const addAssign = tryParseAssignment({ tokens: tokenize("a += b"), tokenIndex: 0 });
  const subtractAssign = tryParseAssignment({ tokens: tokenize("a -= b"), tokenIndex: 0 });
  const mulAssign = tryParseAssignment({ tokens: tokenize("a *= b"), tokenIndex: 0 });
  const divideAssign = tryParseAssignment({ tokens: tokenize("a /= b"), tokenIndex: 0 });
  const moduloAssign = tryParseAssignment({ tokens: tokenize("a %= b"), tokenIndex: 0 });
  const bitwiseAndAssign = tryParseAssignment({ tokens: tokenize("a &= b"), tokenIndex: 0 });
  const bitwiseOrAssign = tryParseAssignment({ tokens: tokenize("a |= b"), tokenIndex: 0 });
  const bitwiseXOrAssign = tryParseAssignment({ tokens: tokenize("a ^= b"), tokenIndex: 0 });
  const shiftRightAssign = tryParseAssignment({ tokens: tokenize("a >>= b"), tokenIndex: 0 });
  const shiftLeftAssign = tryParseAssignment({ tokens: tokenize("a <<= b"), tokenIndex: 0 });

  expect(assign).toBeDefined();
  expect(addAssign).toBeDefined();
  expect(subtractAssign).toBeDefined();
  expect(mulAssign).toBeDefined();
  expect(divideAssign).toBeDefined();
  expect(moduloAssign).toBeDefined();
  expect(bitwiseAndAssign).toBeDefined();
  expect(bitwiseOrAssign).toBeDefined();
  expect(bitwiseXOrAssign).toBeDefined();
  expect(shiftRightAssign).toBeDefined();
  expect(shiftLeftAssign).toBeDefined();

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
  const increment = tryParseUnaryOperation({ tokens: tokenize("++id"), tokenIndex: 0 });
  const decrement = tryParseUnaryOperation({ tokens: tokenize("--id"), tokenIndex: 0 });
  const subtract = tryParseUnaryOperation({ tokens: tokenize("-id"), tokenIndex: 0 });
  const _delete = tryParseUnaryOperation({ tokens: tokenize("delete id"), tokenIndex: 0 });

  expect(increment).toBeDefined();
  expect(decrement).toBeDefined();
  expect(subtract).toBeDefined();
  expect(_delete).toBeDefined();

  expect(increment!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(decrement!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(subtract!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(_delete!.ast).toBe(Ast.AstType.UnaryOperation);
});

test("binary operation", () => {
  const add = tryParseBinaryOperation({ tokens: tokenize("a + b"), tokenIndex: 0 });
  const subtract = tryParseBinaryOperation({ tokens: tokenize("a - b"), tokenIndex: 0 });
  const mul = tryParseBinaryOperation({ tokens: tokenize("a * b"), tokenIndex: 0 });
  const divide = tryParseBinaryOperation({ tokens: tokenize("a / b"), tokenIndex: 0 });
  const modulo = tryParseBinaryOperation({ tokens: tokenize("a % b"), tokenIndex: 0 });
  const power = tryParseBinaryOperation({ tokens: tokenize("a ** b"), tokenIndex: 0 });
  const and = tryParseBinaryOperation({ tokens: tokenize("a && b"), tokenIndex: 0 });
  const or = tryParseBinaryOperation({ tokens: tokenize("a || b"), tokenIndex: 0 });
  const equal = tryParseBinaryOperation({ tokens: tokenize("a == b"), tokenIndex: 0 });
  const notEqual = tryParseBinaryOperation({ tokens: tokenize("a != b"), tokenIndex: 0 });
  const less = tryParseBinaryOperation({ tokens: tokenize("a < b"), tokenIndex: 0 });
  const lessEqual = tryParseBinaryOperation({ tokens: tokenize("a <= b"), tokenIndex: 0 });
  const more = tryParseBinaryOperation({ tokens: tokenize("a > b"), tokenIndex: 0 });
  const moreEqual = tryParseBinaryOperation({ tokens: tokenize("a >= b"), tokenIndex: 0 });
  const bitwiseAnd = tryParseBinaryOperation({ tokens: tokenize("a & b"), tokenIndex: 0 });
  const bitwiseOr = tryParseBinaryOperation({ tokens: tokenize("a | b"), tokenIndex: 0 });
  const bitwiseXOr = tryParseBinaryOperation({ tokens: tokenize("a ^ b"), tokenIndex: 0 });
  const shiftRight = tryParseBinaryOperation({ tokens: tokenize("a >> b"), tokenIndex: 0 });
  const shiftLeft = tryParseBinaryOperation({ tokens: tokenize("a << b"), tokenIndex: 0 });

  expect(add).toBeDefined();
  expect(subtract).toBeDefined();
  expect(mul).toBeDefined();
  expect(divide).toBeDefined();
  expect(modulo).toBeDefined();
  expect(power).toBeDefined();
  expect(and).toBeDefined();
  expect(or).toBeDefined();
  expect(equal).toBeDefined();
  expect(notEqual).toBeDefined();
  expect(less).toBeDefined();
  expect(lessEqual).toBeDefined();
  expect(more).toBeDefined();
  expect(moreEqual).toBeDefined();
  expect(bitwiseAnd).toBeDefined();
  expect(bitwiseOr).toBeDefined();
  expect(bitwiseXOr).toBeDefined();
  expect(shiftRight).toBeDefined();
  expect(shiftLeft).toBeDefined();

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
});

test("conditional expression", () => {
  const conditional = tryParseConditionalExpression({
    tokens: tokenize("a ? b : c"),
    tokenIndex: 0,
  });

  expect(conditional).toBeDefined();

  expect(conditional!.ast).toBe(Ast.AstType.ConditionalExpression);
});

test.todo("function call expression");

test.todo("member access expression");

test.todo("index access expression");

test.todo("new expression");

test.skip("tuple expression", () => {
  const emptyTuple = tryParseTupleExpression({ tokens: tokenize("()"), tokenIndex: 0 });
  const singleTuple = tryParseTupleExpression({ tokens: tokenize("(a)"), tokenIndex: 0 });
  const manyTuple = tryParseTupleExpression({ tokens: tokenize("(a,b,c)"), tokenIndex: 0 });

  expect(emptyTuple).toBeDefined();
  expect(singleTuple).toBeDefined();
  expect(manyTuple).toBeDefined();

  expect(emptyTuple!.ast).toBe(Ast.AstType.TupleExpression);
  expect(singleTuple!.ast).toBe(Ast.AstType.TupleExpression);
  expect(manyTuple!.ast).toBe(Ast.AstType.TupleExpression);

  expect(emptyTuple!.expressions).toHaveLength(0);
  expect(singleTuple!.expressions).toHaveLength(1);
  expect(manyTuple!.expressions).toHaveLength(2);
});

test.todo("variable declaration");
