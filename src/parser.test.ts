import { expect, test } from "bun:test";
import { NotImplementedError } from "./errors/notImplemented.js";
import { tokenize } from "./lexer.js";
import {
  tryParseBlockStatement,
  tryParseBreakStatement,
  tryParseContinueStatement,
  tryParseEmitStatement,
  tryParseExpression,
  tryParseExpressionStatement,
  tryParseFunctionCallExpression,
  tryParseIfStatement,
  tryParseNewExpression,
  tryParsePlaceholderStatement,
  tryParseReturnStatement,
  tryParseRevertStatement,
  tryParseTupleExpression,
  tryParseUncheckedBlockStatement,
  tryParseVariableDeclaration,
  tryParseWhileStatement,
} from "./parser.js";
import { Ast } from "./types/ast.js";
import { Token } from "./types/token.js";
import { never } from "./utils/never.js";

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

    case Ast.AstType.BinaryOperation:
      return `(${binaryOperatorToString(expression.operator)} ${expressionToString(expression.left)} ${expressionToString(expression.right)})`;

    case Ast.AstType.MemberAccessExpression:
      return `(. ${expressionToString(expression.expression)} ${expressionToString(expression.member)})`;

    default:
      throw new NotImplementedError({ source: "none" });
  }
};

// expressions

test("identifier", () => {
  const identifier = tryParseExpression({
    tokens: tokenize("id"),
    tokenIndex: 0,
  }) as Ast.Identifier | undefined;

  expect(identifier).toBeDefined();
  expect(identifier!.ast).toBe(Ast.AstType.Identifier);
  expect(identifier!.token.value).toBe("id");
});

test("literal", () => {
  // const stringLiteral = tryParseExpression({
  //   tokens: tokenize(`"stringLiteral"`),
  //   tokenIndex: 0,
  // }) as Ast.Literal | undefined;
  // const addressLiteral = tryParseExpression({
  //   tokens: tokenize("0x0000000000000000000000000000"),
  //   tokenIndex: 0,
  // }) as Ast.Literal | undefined;
  // const hexLiteral = tryParseExpression({ tokens: tokenize(`hex"0x0"`), tokenIndex: 0 }) as
  //   | Ast.Literal
  //   | undefined;
  const numberLiteral = tryParseExpression({ tokens: tokenize("52"), tokenIndex: 0 }) as
    | Ast.Literal
    | undefined;
  // const rationalNumberLiteral = tryParseExpression({ tokens: tokenize("52.0"), tokenIndex: 0 }) as
  //   | Ast.Literal
  //   | undefined;
  // TODO(kyle): hexNumberLiteral
  // const boolLiteral = tryParseExpression({ tokens: tokenize("true"), tokenIndex: 0 }) as
  //   | Ast.Literal
  //   | undefined;

  // expect(stringLiteral).toBeDefined();
  // expect(addressLiteral).toBeDefined();
  // expect(hexLiteral).toBeDefined();
  expect(numberLiteral).toBeDefined();
  // expect(rationalNumberLiteral).toBeDefined();
  // expect(boolLiteral).toBeDefined();

  // expect(stringLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(addressLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(hexLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(numberLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(rationalNumberLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(boolLiteral!.ast).toBe(Ast.AstType.Literal);
});

test("assignment", () => {
  const assign = tryParseExpression({ tokens: tokenize("a = b"), tokenIndex: 0 });
  // const addAssign = tryParseExpression({tokens: tokenize("a += b"), tokenIndex: 0});
  // const subtractAssign = tryParseExpression({tokens: tokenize("a -= b"), tokenIndex: 0});
  // const mulAssign = tryParseExpression({tokens: tokenize("a *= b"), tokenIndex: 0});
  // const divideAssign = tryParseExpression({tokens: tokenize("a /= b"), tokenIndex: 0});
  // const moduloAssign = tryParseExpression({tokens: tokenize("a %= b"), tokenIndex: 0});
  // const bitwiseAndAssign = tryParseExpression({tokens: tokenize("a &= b"), tokenIndex: 0});
  // const bitwiseOrAssign = tryParseExpression({tokens: tokenize("a |= b"), tokenIndex: 0});
  // const bitwiseXOrAssign = tryParseExpression({tokens: tokenize("a ^= b"), tokenIndex: 0});
  // const shiftRightAssign = tryParseExpression({tokens: tokenize("a >>= b"), tokenIndex: 0});
  // const shiftLeftAssign = tryParseExpression({tokens: tokenize("a <<= b"), tokenIndex: 0});

  expect(assign).toBeDefined();
  // expect(addAssign).toBeDefined();
  // expect(subtractAssign).toBeDefined();
  // expect(mulAssign).toBeDefined();
  // expect(divideAssign).toBeDefined();
  // expect(moduloAssign).toBeDefined();
  // expect(bitwiseAndAssign).toBeDefined();
  // expect(bitwiseOrAssign).toBeDefined();
  // expect(bitwiseXOrAssign).toBeDefined();
  // expect(shiftRightAssign).toBeDefined();
  // expect(shiftLeftAssign).toBeDefined();

  expect(assign!.ast).toBe(Ast.AstType.Assignment);
  // expect(addAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(subtractAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(mulAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(divideAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(moduloAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(bitwiseAndAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(bitwiseOrAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(bitwiseXOrAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(shiftRightAssign!.ast).toBe(Ast.AstType.Assignment);
  // expect(shiftLeftAssign!.ast).toBe(Ast.AstType.Assignment);
});

test("unary operation", () => {
  const incrementPostfix = tryParseExpression({ tokens: tokenize("id++"), tokenIndex: 0 });
  const decrementPostfix = tryParseExpression({ tokens: tokenize("id--"), tokenIndex: 0 });
  // const incrementPrefix = tryParseExpression({ tokens: tokenize("++id"), tokenIndex: 0 });
  // const decrementPrefix = tryParseExpression({ tokens: tokenize("--id"), tokenIndex: 0 });
  const subtract = tryParseExpression({ tokens: tokenize("-id"), tokenIndex: 0 });
  // const _delete = tryParseExpression({tokens: tokenize("delete id"), tokenIndex: 0});

  expect(incrementPostfix).toBeDefined();
  expect(decrementPostfix).toBeDefined();
  // expect(incrementPrefix).toBeDefined();
  // expect(decrementPrefix).toBeDefined();
  expect(subtract).toBeDefined();
  // expect(_delete).toBeDefined();

  expect(incrementPostfix!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(decrementPostfix!.ast).toBe(Ast.AstType.UnaryOperation);
  // expect(incrementPrefix!.ast).toBe(Ast.AstType.UnaryOperation);
  // expect(decrementPrefix!.ast).toBe(Ast.AstType.UnaryOperation);
  expect(subtract!.ast).toBe(Ast.AstType.UnaryOperation);
  // expect(_delete!.ast).toBe(Ast.AstType.UnaryOperation);
});

test("binary operation", () => {
  const add = tryParseExpression({ tokens: tokenize("a + b"), tokenIndex: 0 });
  const subtract = tryParseExpression({ tokens: tokenize("a - b"), tokenIndex: 0 });
  const mul = tryParseExpression({ tokens: tokenize("a * b"), tokenIndex: 0 });
  const divide = tryParseExpression({ tokens: tokenize("a / b"), tokenIndex: 0 });
  const modulo = tryParseExpression({ tokens: tokenize("a % b"), tokenIndex: 0 });
  // const power = tryParseExpression({ tokens: tokenize("a ** b"), tokenIndex: 0 });
  // const and = tryParseExpression({ tokens: tokenize("a && b"), tokenIndex: 0 });
  // const or = tryParseExpression({ tokens: tokenize("a || b"), tokenIndex: 0 });
  // const equal = tryParseExpression({ tokens: tokenize("a == b"), tokenIndex: 0 });
  // const notEqual = tryParseExpression({ tokens: tokenize("a != b"), tokenIndex: 0 });
  // const less = tryParseExpression({ tokens: tokenize("a < b"), tokenIndex: 0 });
  // const lessEqual = tryParseExpression({ tokens: tokenize("a <= b"), tokenIndex: 0 });
  // const more = tryParseExpression({ tokens: tokenize("a > b"), tokenIndex: 0 });
  // const moreEqual = tryParseExpression({ tokens: tokenize("a >= b"), tokenIndex: 0 });
  // const bitwiseAnd = tryParseExpression({ tokens: tokenize("a & b"), tokenIndex: 0 });
  // const bitwiseOr = tryParseExpression({ tokens: tokenize("a | b"), tokenIndex: 0 });
  // const bitwiseXOr = tryParseExpression({ tokens: tokenize("a ^ b"), tokenIndex: 0 });
  // const shiftRight = tryParseExpression({ tokens: tokenize("a >> b"), tokenIndex: 0 });
  // const shiftLeft = tryParseExpression({ tokens: tokenize("a << b"), tokenIndex: 0 });

  expect(add).toBeDefined();
  expect(subtract).toBeDefined();
  expect(mul).toBeDefined();
  expect(divide).toBeDefined();
  expect(modulo).toBeDefined();
  // expect(power).toBeDefined();
  // expect(and).toBeDefined();
  // expect(or).toBeDefined();
  // expect(equal).toBeDefined();
  // expect(notEqual).toBeDefined();
  // expect(less).toBeDefined();
  // expect(lessEqual).toBeDefined();
  // expect(more).toBeDefined();
  // expect(moreEqual).toBeDefined();
  // expect(bitwiseAnd).toBeDefined();
  // expect(bitwiseOr).toBeDefined();
  // expect(bitwiseXOr).toBeDefined();
  // expect(shiftRight).toBeDefined();
  // expect(shiftLeft).toBeDefined();

  expect(add!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(subtract!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(mul!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(divide!.ast).toBe(Ast.AstType.BinaryOperation);
  expect(modulo!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(power!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(and!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(or!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(equal!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(notEqual!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(less!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(lessEqual!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(more!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(moreEqual!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(bitwiseAnd!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(bitwiseOr!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(bitwiseXOr!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(shiftRight!.ast).toBe(Ast.AstType.BinaryOperation);
  // expect(shiftLeft!.ast).toBe(Ast.AstType.BinaryOperation);

  let expression: Ast.Expression;

  expression = tryParseExpression({ tokens: tokenize("a + b + c"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(+ (+ a b) c)");

  expression = tryParseExpression({ tokens: tokenize("a + b * c * d + e"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(+ (+ a (* (* b c) d)) e)");
});

test("conditional expression", () => {
  const conditional = tryParseExpression({ tokens: tokenize("a ? b : c"), tokenIndex: 0 });

  expect(conditional).toBeDefined();

  expect(conditional!.ast).toBe(Ast.AstType.ConditionalExpression);
});

test.todo("function call expression", () => {
  const [emptyFunction] = getAst("fn()", tryParseFunctionCallExpression);
  const [singleFunction] = getAst("fn(a)", tryParseFunctionCallExpression);
  const [manyFunction] = getAst("fn(a,b,c)", tryParseFunctionCallExpression);

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
  const memberAccess = tryParseExpression({ tokens: tokenize("a.b"), tokenIndex: 0 }) as
    | Ast.MemberAccessExpression
    | undefined;

  expect(memberAccess).toBeDefined();
  expect(memberAccess!.ast).toBe(Ast.AstType.MemberAccessExpression);
  expect(memberAccess!.expression.ast).toBe(Ast.AstType.Identifier);
  expect(memberAccess!.member.ast).toBe(Ast.AstType.Identifier);

  const expression = tryParseExpression({ tokens: tokenize("a.b.c"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(. (. a b) c)");
});

test("index access expression", () => {
  const indexAccess = tryParseExpression({ tokens: tokenize("a[0]"), tokenIndex: 0 }) as
    | Ast.IndexAccessExpression
    | undefined;

  expect(indexAccess).toBeDefined();
  expect(indexAccess!.ast).toBe(Ast.AstType.IndexAccessExpression);
  expect(indexAccess!.base.ast).toBe(Ast.AstType.Identifier);
  expect(indexAccess!.index.ast).toBe(Ast.AstType.Literal);
});

test.todo("new expression", () => {
  const [_new] = getAst("new Contract()", tryParseNewExpression);

  expect(_new).toBeDefined();
  expect(_new!.ast).toBe(Ast.AstType.NewExpression);
});

test.todo("tuple expression", () => {
  const [emptyTuple] = getAst("()", tryParseTupleExpression);
  const [singleTuple] = getAst("(a)", tryParseTupleExpression);
  const [manyTuple] = getAst("(a,b,c)", tryParseTupleExpression);
  //
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

test.todo("variable declaration", () => {
  const [noInitializer] = getAst("uint256 a", tryParseVariableDeclaration);
  const [initializer] = getAst("uint256 a = 0", tryParseVariableDeclaration);
  const [location] = getAst("uint256 memory a", tryParseVariableDeclaration);

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
  const identifier = tryParseExpressionStatement({ tokens: tokenize("a;"), tokenIndex: 0 });
  const literal = tryParseExpressionStatement({ tokens: tokenize("52;"), tokenIndex: 0 });
  const assignment = tryParseExpressionStatement({ tokens: tokenize("a = 52;"), tokenIndex: 0 });
  // const unaryOperation = tryParseExpressionStatement({
  //   tokens: tokenize("delete a;"),
  //   tokenIndex: 0,
  // });
  const binaryOperation = tryParseExpressionStatement({
    tokens: tokenize("a + b;"),
    tokenIndex: 0,
  });
  const conditional = tryParseExpressionStatement({
    tokens: tokenize("a ? b : c;"),
    tokenIndex: 0,
  });
  // const functionCall = tryParseExpressionStatement({
  //   tokens: tokenize("a();"),
  //   tokenIndex: 0,
  // });
  const memberAccess = tryParseExpressionStatement({ tokens: tokenize("a.b;"), tokenIndex: 0 });
  const indexAccess = tryParseExpressionStatement({ tokens: tokenize("a[52];"), tokenIndex: 0 });
  // const _new = tryParseExpressionStatement({
  //   tokens: tokenize("new a();"),
  //   tokenIndex: 0,
  // });
  // const tuple = tryParseExpressionStatement({
  //   tokens: tokenize("(a,b);"),
  //   tokenIndex: 0,
  // });
  // const variableDeclaration = tryParseExpressionStatement({
  //   tokens: tokenize("uint256 a;"),
  //   tokenIndex: 0,
  // });
  const parenthesized = tryParseExpressionStatement({
    tokens: tokenize("(((a + b)));"),
    tokenIndex: 0,
  });

  expect(identifier).toBeDefined();
  expect(literal).toBeDefined();
  expect(assignment).toBeDefined();
  // expect(unaryOperation).toBeDefined();
  expect(binaryOperation).toBeDefined();
  expect(conditional).toBeDefined();
  // expect(functionCall).toBeDefined();
  expect(memberAccess).toBeDefined();
  expect(indexAccess).toBeDefined();
  // expect(_new).toBeDefined();
  // expect(tuple).toBeDefined();
  // expect(variableDeclaration).toBeDefined();
  expect(parenthesized).toBeDefined();

  expect(identifier!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(literal!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(assignment!.ast).toBe(Ast.AstType.ExpressionStatement);
  // expect(unaryOperation!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(binaryOperation!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(conditional!.ast).toBe(Ast.AstType.ExpressionStatement);
  // expect(functionCall!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(memberAccess!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(indexAccess!.ast).toBe(Ast.AstType.ExpressionStatement);
  // expect(_new!.ast).toBe(Ast.AstType.ExpressionStatement);
  // expect(tuple!.ast).toBe(Ast.AstType.ExpressionStatement);
  // expect(variableDeclaration!.ast).toBe(Ast.AstType.ExpressionStatement);
  expect(parenthesized!.ast).toBe(Ast.AstType.ExpressionStatement);
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

test.todo("emit statement", () => {
  const emit = tryParseEmitStatement({ tokens: tokenize("emit Log();"), tokenIndex: 0 });

  expect(emit).toBeDefined();

  expect(emit!.ast).toBe(Ast.AstType.EmitStatement);
});

test.todo("revert statement", () => {
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
