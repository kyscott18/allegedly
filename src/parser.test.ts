import { expect, test } from "bun:test";
import { tokenize } from "./lexer.js";
import {
  tryParseAssignment,
  tryParseBinaryOperation,
  tryParseBlockStatement,
  tryParseBreakStatement,
  tryParseConditionalExpression,
  tryParseContinueStatement,
  tryParseEmitStatement,
  tryParseExpressionStatement,
  tryParseFunctionCallExpression,
  tryParseIdentifier,
  tryParseIfStatement,
  tryParseIndexAccessExpression,
  tryParseLiteral,
  tryParseMemberAccessExpression,
  tryParseNewExpression,
  tryParsePlaceholderStatement,
  tryParseReturnStatement,
  tryParseRevertStatement,
  tryParseTupleExpression,
  tryParseUnaryOperation,
  tryParseUncheckedBlockStatement,
  tryParseVariableDeclaration,
  tryParseWhileStatement,
} from "./parser.js";
import { Ast } from "./types/ast.js";

// TODO(kyle) test `parse` entry point function

// expressions

test("identifier", () => {
  const identifier = tryParseIdentifier({ tokens: tokenize("id"), tokenIndex: 0 });

  expect(identifier).toBeDefined();
  expect(identifier!.ast).toBe(Ast.AstType.Identifier);
});

test.todo("literal", () => {
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

test("function call expression", () => {
  const emptyFunction = tryParseFunctionCallExpression({ tokens: tokenize("fn()"), tokenIndex: 0 });
  const singleFunction = tryParseFunctionCallExpression({
    tokens: tokenize("fn(a)"),
    tokenIndex: 0,
  });
  const manyFunction = tryParseFunctionCallExpression({
    tokens: tokenize("fn(a,b,c)"),
    tokenIndex: 0,
  });

  expect(emptyFunction).toBeDefined();
  expect(singleFunction).toBeDefined();
  expect(manyFunction).toBeDefined();

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
  const memberAccess = tryParseMemberAccessExpression({ tokens: tokenize("a.b"), tokenIndex: 0 });

  expect(memberAccess).toBeDefined();
  expect(memberAccess!.ast).toBe(Ast.AstType.MemberAccessExpression);
  expect(memberAccess!.expression.ast).toBe(Ast.AstType.Identifier);
  expect(memberAccess!.member.ast).toBe(Ast.AstType.Identifier);
});

test("index access expression", () => {
  const indexAccess = tryParseIndexAccessExpression({ tokens: tokenize("a[0]"), tokenIndex: 0 });

  expect(indexAccess).toBeDefined();
  expect(indexAccess!.ast).toBe(Ast.AstType.IndexAccessExpression);
  expect(indexAccess!.base.ast).toBe(Ast.AstType.Identifier);
  expect(indexAccess!.index.ast).toBe(Ast.AstType.Literal);
});

test("new expression", () => {
  const _new = tryParseNewExpression({ tokens: tokenize("new Contract"), tokenIndex: 0 });

  expect(_new).toBeDefined();
  expect(_new!.ast).toBe(Ast.AstType.NewExpression);
});

test("tuple expression", () => {
  const emptyTuple = tryParseTupleExpression({ tokens: tokenize("()"), tokenIndex: 0 });
  const singleTuple = tryParseTupleExpression({ tokens: tokenize("(a)"), tokenIndex: 0 });
  const manyTuple = tryParseTupleExpression({ tokens: tokenize("(a,b,c)"), tokenIndex: 0 });

  expect(emptyTuple).toBeDefined();
  expect(singleTuple).toBeDefined();
  expect(manyTuple).toBeDefined();

  expect(emptyTuple!.ast).toBe(Ast.AstType.TupleExpression);
  expect(singleTuple!.ast).toBe(Ast.AstType.TupleExpression);
  expect(manyTuple!.ast).toBe(Ast.AstType.TupleExpression);

  expect(emptyTuple!.elements).toHaveLength(0);
  expect(singleTuple!.elements).toHaveLength(1);
  expect(manyTuple!.elements).toHaveLength(3);
});

test("variable declaration", () => {
  const noInitializer = tryParseVariableDeclaration({
    tokens: tokenize("uint256 a"),
    tokenIndex: 0,
  });
  const initializer = tryParseVariableDeclaration({
    tokens: tokenize("uint256 a = 0"),
    tokenIndex: 0,
  });
  const location = tryParseVariableDeclaration({
    tokens: tokenize("uint256 memory a"),
    tokenIndex: 0,
  });

  // TODO(kyle) attributes

  expect(noInitializer).toBeDefined();
  expect(initializer).toBeDefined();
  expect(location).toBeDefined();

  expect(noInitializer!.ast).toBe(Ast.AstType.VariableDeclaration);
  expect(initializer!.ast).toBe(Ast.AstType.VariableDeclaration);
  expect(location!.ast).toBe(Ast.AstType.VariableDeclaration);

  expect(initializer!.initializer).toBeDefined();
});

// statements

test("expression statement", () => {
  const expressionStatement = tryParseExpressionStatement({
    tokens: tokenize("uint256 a;"),
    tokenIndex: 0,
  });

  expect(expressionStatement).toBeDefined();
  expect(expressionStatement!.ast).toBe(Ast.AstType.ExpressionStatement);
});

test("block statement", () => {
  const emptyBlock = tryParseBlockStatement({ tokens: tokenize("{}"), tokenIndex: 0 });
  const singleBlock = tryParseBlockStatement({ tokens: tokenize("{a;}"), tokenIndex: 0 });
  const manyBlock = tryParseBlockStatement({ tokens: tokenize("{a; b;}"), tokenIndex: 0 });

  expect(emptyBlock).toBeDefined();
  expect(singleBlock).toBeDefined();
  expect(manyBlock).toBeDefined();

  expect(emptyBlock!.ast).toBe(Ast.AstType.BlockStatement);
  expect(singleBlock!.ast).toBe(Ast.AstType.BlockStatement);
  expect(manyBlock!.ast).toBe(Ast.AstType.BlockStatement);

  expect(emptyBlock!.statements).toHaveLength(0);
  expect(manyBlock!.statements).toHaveLength(2);
  expect(singleBlock!.statements).toHaveLength(1);
});

test("unchecked block statement", () => {
  const emptyBlock = tryParseUncheckedBlockStatement({
    tokens: tokenize("unchecked {}"),
    tokenIndex: 0,
  });
  const singleBlock = tryParseUncheckedBlockStatement({
    tokens: tokenize("unchecked {a;}"),
    tokenIndex: 0,
  });
  const manyBlock = tryParseUncheckedBlockStatement({
    tokens: tokenize("unchecked { a; b; }"),
    tokenIndex: 0,
  });

  expect(emptyBlock).toBeDefined();
  expect(singleBlock).toBeDefined();
  expect(manyBlock).toBeDefined();

  expect(emptyBlock!.ast).toBe(Ast.AstType.UncheckedBlockStatement);
  expect(singleBlock!.ast).toBe(Ast.AstType.UncheckedBlockStatement);
  expect(manyBlock!.ast).toBe(Ast.AstType.UncheckedBlockStatement);

  expect(emptyBlock!.statements).toHaveLength(0);
  expect(singleBlock!.statements).toHaveLength(1);
  expect(manyBlock!.statements).toHaveLength(2);
});

test.todo("if statement", () => {
  const _if = tryParseIfStatement({ tokens: tokenize("if (a) { b; }"), tokenIndex: 0 });
  const _ifElse = tryParseIfStatement({
    tokens: tokenize("if (a) { b; } else { c; }"),
    tokenIndex: 0,
  });

  expect(_if).toBeDefined();
  expect(_ifElse).toBeDefined();

  expect(_if!.ast).toBe(Ast.AstType.IfStatement);
  expect(_ifElse!.ast).toBe(Ast.AstType.IfStatement);
});

test.todo("for statement", () => {});

test.todo("while statement", () => {
  const _while = tryParseWhileStatement({ tokens: tokenize("while (a) { b; }"), tokenIndex: 0 });

  expect(_while).toBeDefined();

  expect(_while!.ast).toBe(Ast.AstType.WhileStatement);
});

test.todo("do while statement");

test("break statement", () => {
  const _break = tryParseBreakStatement({ tokens: tokenize("break;"), tokenIndex: 0 });

  expect(_break).toBeDefined();

  expect(_break!.ast).toBe(Ast.AstType.BreakStatement);
});

test("continue statement", () => {
  const _continue = tryParseContinueStatement({ tokens: tokenize("continue;"), tokenIndex: 0 });

  expect(_continue).toBeDefined();

  expect(_continue!.ast).toBe(Ast.AstType.ContinueStatement);
});

test("emit statement", () => {
  const emit = tryParseEmitStatement({ tokens: tokenize("emit Log();"), tokenIndex: 0 });

  expect(emit).toBeDefined();

  expect(emit!.ast).toBe(Ast.AstType.EmitStatement);
});

test("revert statement", () => {
  const revert = tryParseRevertStatement({ tokens: tokenize("revert Error();"), tokenIndex: 0 });

  expect(revert).toBeDefined();

  expect(revert!.ast).toBe(Ast.AstType.RevertStatement);
});

test.todo("return statement", () => {
  const _return = tryParseReturnStatement({ tokens: tokenize("return;"), tokenIndex: 0 });
  const _returnExpression = tryParseReturnStatement({
    tokens: tokenize("return a;"),
    tokenIndex: 0,
  });

  expect(_return).toBeDefined();
  expect(_returnExpression).toBeDefined();

  expect(_return!.ast).toBe(Ast.AstType.ReturnStatement);
  expect(_returnExpression!.ast).toBe(Ast.AstType.ReturnStatement);
});

test.todo("placehoder statement", () => {
  const placeholder = tryParsePlaceholderStatement({ tokens: tokenize("_;"), tokenIndex: 0 });

  expect(placeholder).toBeDefined();

  expect(placeholder!.ast).toBe(Ast.AstType.PlaceholderStatement);
});
