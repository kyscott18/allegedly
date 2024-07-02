import { expect, test } from "bun:test";
import { tokenize } from "./lexer.js";
import { tryParseBinaryOperation, tryParseIdentifier, tryParseUnaryOperation } from "./parser.js";
import { Ast } from "./types/ast.js";

test("identifier", () => {
  const identifier = tryParseIdentifier({ tokens: tokenize("id"), tokenIndex: 0 });

  expect(identifier).toBeDefined();
  expect(identifier!.ast).toBe(Ast.AstType.Identifier);
});

test.todo("literal");

test.todo("assignment");

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
