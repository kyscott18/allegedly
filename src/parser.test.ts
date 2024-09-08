import { expect, test } from "bun:test";
import path from "node:path";
import { InvariantViolationError } from "./errors/invariantViolation.js";
import { tokenize } from "./lexer.js";
import {
  type ParseContext,
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
    case Token.disc.Assign:
      return "=";
    case Token.disc.AddAssign:
      return "+=";
    case Token.disc.SubtractAssign:
      return "-=";
    case Token.disc.MulAssign:
      return "*=";
    case Token.disc.DivideAssign:
      return "/=";
    case Token.disc.ModuloAssign:
      return "%=";
    case Token.disc.BitwiseAndAssign:
      return "&=";
    case Token.disc.BitwiseOrAssign:
      return "|=";
    case Token.disc.BitwiseXOrAssign:
      return "^=";
    case Token.disc.ShiftRightAssign:
      return ">>=";
    case Token.disc.ShiftLeftAssign:
      return "<<=";
  }
};
const unaryOperatorToString = (operator: Ast.UnaryOperation["operator"]): string => {
  switch (operator.token) {
    case Token.disc.Increment:
      return "++";
    case Token.disc.Decrement:
      return "--";
    case Token.disc.Subtract:
      return "-";
    case Token.disc.Delete:
      return "delete";
    case Token.disc.Not:
      return "!";
    case Token.disc.BitwiseNot:
      return "~";
  }
};

const binaryOperatorToString = (operator: Ast.BinaryOperation["operator"]): string => {
  switch (operator.token) {
    case Token.disc.Add:
      return "+";
    case Token.disc.Subtract:
      return "-";
    case Token.disc.Mul:
      return "*";
    case Token.disc.Divide:
      return "/";
    case Token.disc.Modulo:
      return "%";
    case Token.disc.Power:
      return "**";
    case Token.disc.And:
      return "&&";
    case Token.disc.Or:
      return "||";
    case Token.disc.Equal:
      return "==";
    case Token.disc.NotEqual:
      return "!=";
    case Token.disc.Less:
      return "<";
    case Token.disc.LessEqual:
      return "<=";
    case Token.disc.More:
      return ">";
    case Token.disc.MoreEqual:
      return ">=";
    case Token.disc.BitwiseAnd:
      return "&";
    case Token.disc.BitwiseOr:
      return "|";
    case Token.disc.BitwiseXOr:
      return "^";
    case Token.disc.ShiftRight:
      return ">>";
    case Token.disc.ShiftLeft:
      return "<<";

    default:
      never(operator);
      return "";
  }
};

/** converts an expression to a polish notation string */
const expressionToString = (expression: Ast.Expression): string => {
  switch (expression.ast) {
    case Ast.disc.Literal:
    case Ast.disc.Identifier:
      // @ts-ignore
      return expression.token.value;

    case Ast.disc.Assignment:
      return `(${assignmentOperatorToString(expression.operator)} ${expressionToString(expression.left)} ${expressionToString(expression.right)})`;

    case Ast.disc.UnaryOperation:
      return expression.prefix
        ? `(${unaryOperatorToString(expression.operator)} ${expressionToString(expression.expression)})`
        : `(${expressionToString(expression.expression)} ${unaryOperatorToString(expression.operator)})`;

    case Ast.disc.BinaryOperation:
      return `(${binaryOperatorToString(expression.operator)} ${expressionToString(expression.left)} ${expressionToString(expression.right)})`;

    case Ast.disc.ConditionalExpression:
      return `(? ${expressionToString(expression.condition)} ${expressionToString(expression.trueExpression)} ${expressionToString(expression.falseExpression)})`;

    case Ast.disc.MemberAccessExpression:
      return `(. ${expressionToString(expression.expression)} ${expressionToString(expression.member)})`;

    default:
      throw new InvariantViolationError();
  }
};

const getAst = <ast>(source: string, parser: (context: ParseContext) => ast) => {
  return parser({ source, tokens: tokenize(source), tokenIndex: 0 });
};

// expressions

test("identifier", () => {
  const identifier = getAst("id", parseExpression) as Ast.Identifier;

  expect(identifier!.ast).toBe(Ast.disc.Identifier);
  // @ts-ignore
  expect(identifier!.token.value).toBe("id");
});

test("literal", () => {
  // const stringLiteral = parseExpression({
  //   tokens: tokenize(`"stringLiteral"`),
  //   tokenIndex: 0,
  // }) as Ast.Literal
  // const addressLiteral = parseExpression({
  //   tokens: tokenize("0x0000000000000000000000000000"),
  //   tokenIndex: 0,
  // }) as Ast.Literal
  // const hexLiteral = parseExpression({ tokens: tokenize(`hex"0x0"`), tokenIndex: 0 }) as
  //   | Ast.Literal
  //
  const numberLiteral = getAst("52", parseExpression) as Ast.Literal;
  // const rationalNumberLiteral = parseExpression({ tokens: tokenize("52.0"), tokenIndex: 0 }) as
  //   | Ast.Literal
  //
  // TODO(kyle): hexNumberLiteral
  const boolLiteral = getAst("true", parseExpression) as Ast.Literal;

  // expect(stringLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(addressLiteral!.ast).toBe(Ast.AstType.Literal);
  // expect(hexLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(numberLiteral!.ast).toBe(Ast.disc.Literal);
  // expect(rationalNumberLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(boolLiteral!.ast).toBe(Ast.disc.Literal);
});

test("assignment", () => {
  const assign = getAst("a = b", parseExpression);
  const addAssign = getAst("a += b", parseExpression);
  const subtractAssign = getAst("a -= b", parseExpression);
  const mulAssign = getAst("a *= b", parseExpression);
  const divideAssign = getAst("a /= b", parseExpression);
  const moduloAssign = getAst("a %= b", parseExpression);
  const bitwiseAndAssign = getAst("a &= b", parseExpression);
  const bitwiseOrAssign = getAst("a |= b", parseExpression);
  const bitwiseXOrAssign = getAst("a ^= b", parseExpression);
  const shiftRightAssign = getAst("a >>= b", parseExpression);
  const shiftLeftAssign = getAst("a <<= b", parseExpression);

  expect(assign!.ast).toBe(Ast.disc.Assignment);
  expect(addAssign!.ast).toBe(Ast.disc.Assignment);
  expect(subtractAssign!.ast).toBe(Ast.disc.Assignment);
  expect(mulAssign!.ast).toBe(Ast.disc.Assignment);
  expect(divideAssign!.ast).toBe(Ast.disc.Assignment);
  expect(moduloAssign!.ast).toBe(Ast.disc.Assignment);
  expect(bitwiseAndAssign!.ast).toBe(Ast.disc.Assignment);
  expect(bitwiseOrAssign!.ast).toBe(Ast.disc.Assignment);
  expect(bitwiseXOrAssign!.ast).toBe(Ast.disc.Assignment);
  expect(shiftRightAssign!.ast).toBe(Ast.disc.Assignment);
  expect(shiftLeftAssign!.ast).toBe(Ast.disc.Assignment);
});

test("unary operation", () => {
  const incrementPostfix = getAst("id++", parseExpression);
  const decrementPostfix = getAst("id--", parseExpression);
  const incrementPrefix = getAst("++id", parseExpression);
  const decrementPrefix = getAst("--id", parseExpression);
  const subtract = getAst("-id", parseExpression);
  const _delete = getAst("delete id", parseExpression);
  const not = getAst("!id", parseExpression);
  const bitwiseNot = getAst("~id", parseExpression);

  expect(incrementPostfix!.ast).toBe(Ast.disc.UnaryOperation);
  expect(decrementPostfix!.ast).toBe(Ast.disc.UnaryOperation);
  expect(incrementPrefix!.ast).toBe(Ast.disc.UnaryOperation);
  expect(decrementPrefix!.ast).toBe(Ast.disc.UnaryOperation);
  expect(subtract!.ast).toBe(Ast.disc.UnaryOperation);
  expect(_delete!.ast).toBe(Ast.disc.UnaryOperation);
  expect(not!.ast).toBe(Ast.disc.UnaryOperation);
  expect(bitwiseNot!.ast).toBe(Ast.disc.UnaryOperation);
});

test("binary operation", () => {
  const add = getAst("a + b", parseExpression);
  const subtract = getAst("a - b", parseExpression);
  const mul = getAst("a * b", parseExpression);
  const divide = getAst("a / b", parseExpression);
  const modulo = getAst("a % b", parseExpression);
  const power = getAst("a ** b", parseExpression);
  const and = getAst("a && b", parseExpression);
  const or = getAst("a || b", parseExpression);
  const equal = getAst("a == b", parseExpression);
  const notEqual = getAst("a != b", parseExpression);
  const less = getAst("a < b", parseExpression);
  const lessEqual = getAst("a <= b", parseExpression);
  const more = getAst("a > b", parseExpression);
  const moreEqual = getAst("a >= b", parseExpression);
  const bitwiseAnd = getAst("a & b", parseExpression);
  const bitwiseOr = getAst("a | b", parseExpression);
  const bitwiseXOr = getAst("a ^ b", parseExpression);
  const shiftRight = getAst("a >> b", parseExpression);
  const shiftLeft = getAst("a << b", parseExpression);

  expect(add!.ast).toBe(Ast.disc.BinaryOperation);
  expect(subtract!.ast).toBe(Ast.disc.BinaryOperation);
  expect(mul!.ast).toBe(Ast.disc.BinaryOperation);
  expect(divide!.ast).toBe(Ast.disc.BinaryOperation);
  expect(modulo!.ast).toBe(Ast.disc.BinaryOperation);
  expect(power!.ast).toBe(Ast.disc.BinaryOperation);
  expect(and!.ast).toBe(Ast.disc.BinaryOperation);
  expect(or!.ast).toBe(Ast.disc.BinaryOperation);
  expect(equal!.ast).toBe(Ast.disc.BinaryOperation);
  expect(notEqual!.ast).toBe(Ast.disc.BinaryOperation);
  expect(less!.ast).toBe(Ast.disc.BinaryOperation);
  expect(lessEqual!.ast).toBe(Ast.disc.BinaryOperation);
  expect(more!.ast).toBe(Ast.disc.BinaryOperation);
  expect(moreEqual!.ast).toBe(Ast.disc.BinaryOperation);
  expect(bitwiseAnd!.ast).toBe(Ast.disc.BinaryOperation);
  expect(bitwiseOr!.ast).toBe(Ast.disc.BinaryOperation);
  expect(bitwiseXOr!.ast).toBe(Ast.disc.BinaryOperation);
  expect(shiftRight!.ast).toBe(Ast.disc.BinaryOperation);
  expect(shiftLeft!.ast).toBe(Ast.disc.BinaryOperation);

  let expression: Ast.Expression;

  expression = getAst("a + b + c", parseExpression);
  expect(expressionToString(expression)).toBe("(+ (+ a b) c)");

  expression = getAst("a + b * c * d + e", parseExpression);
  expect(expressionToString(expression)).toBe("(+ (+ a (* (* b c) d)) e)");
});

test("conditional expression", () => {
  const conditional = getAst("a ? b : c", parseExpression);
  expect(conditional.ast).toBe(Ast.disc.ConditionalExpression);
});

test("function call expression", () => {
  const emptyFunction = getAst("fn()", parseExpression) as Ast.FunctionCallExpression;
  const singleFunction = getAst("fn(a)", parseExpression) as Ast.FunctionCallExpression;
  const manyFunction = getAst("fn(a,b,c)", parseExpression) as Ast.FunctionCallExpression;

  expect(emptyFunction!.ast).toBe(Ast.disc.FunctionCallExpression);
  expect(singleFunction!.ast).toBe(Ast.disc.FunctionCallExpression);
  expect(manyFunction!.ast).toBe(Ast.disc.FunctionCallExpression);

  expect(emptyFunction!.expression.ast).toBe(Ast.disc.Identifier);
  expect(singleFunction!.expression.ast).toBe(Ast.disc.Identifier);
  expect(manyFunction!.expression.ast).toBe(Ast.disc.Identifier);

  expect(emptyFunction!.arguments).toHaveLength(0);
  expect(singleFunction!.arguments).toHaveLength(1);
  expect(manyFunction!.arguments).toHaveLength(3);
});

test("member access expression", () => {
  const memberAccess = getAst("a.b", parseExpression) as Ast.MemberAccessExpression;
  expect(memberAccess!.ast).toBe(Ast.disc.MemberAccessExpression);
  expect(memberAccess!.expression.ast).toBe(Ast.disc.Identifier);
  expect(memberAccess!.member.ast).toBe(Ast.disc.Identifier);

  const expression = getAst("a.b.c", parseExpression);
  expect(expressionToString(expression)).toBe("(. (. a b) c)");
});

test("index access expression", () => {
  const indexAccess = getAst("a[0]", parseExpression) as Ast.IndexAccessExpression;
  expect(indexAccess!.ast).toBe(Ast.disc.IndexAccessExpression);
  expect(indexAccess!.base.ast).toBe(Ast.disc.Identifier);
  expect(indexAccess!.index.ast).toBe(Ast.disc.Literal);
});

test("new expression", () => {
  const _new = getAst("new Contract()", parseExpression);
  expect(_new!.ast).toBe(Ast.disc.NewExpression);
});

test("tuple expression", () => {
  const tuple = getAst("(a,b,c)", parseExpression) as Ast.TupleExpression;
  expect(tuple!.ast).toBe(Ast.disc.TupleExpression);
  expect(tuple!.elements).toHaveLength(3);
});

// statements

test("expression statement", () => {
  const identifier = getAst("a;", parseStatement);
  const literal = getAst("52;", parseStatement);
  const assignment = getAst("a = 52;", parseStatement);
  const unaryOperation = getAst("delete a;", parseStatement);
  const binaryOperation = getAst("a + b;", parseStatement);
  const conditional = getAst("a ? b : c;", parseStatement);
  const functionCall = getAst("a();", parseStatement);
  const memberAccess = getAst("a.b;", parseStatement);
  const indexAccess = getAst("a[52];", parseStatement);
  const _new = getAst("new a();", parseStatement);
  const tuple = getAst("(a,b);", parseStatement);
  const parenthesized = getAst("(((a + b)));", parseStatement);

  expect(identifier!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(literal!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(assignment!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(unaryOperation!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(binaryOperation!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(conditional!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(functionCall!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(memberAccess!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(indexAccess!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(_new!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(tuple!.ast).toBe(Ast.disc.ExpressionStatement);
  expect(parenthesized!.ast).toBe(Ast.disc.ExpressionStatement);
});

test("block statement", () => {
  const emptyBlock = getAst("{}", parseStatement) as Ast.BlockStatement;
  const singleBlock = getAst("{a;}", parseStatement) as Ast.BlockStatement;
  const manyBlock = getAst("{a; b;}", parseStatement) as Ast.BlockStatement;

  expect(emptyBlock!.ast).toBe(Ast.disc.BlockStatement);
  expect(singleBlock!.ast).toBe(Ast.disc.BlockStatement);
  expect(manyBlock!.ast).toBe(Ast.disc.BlockStatement);

  expect(emptyBlock!.statements).toHaveLength(0);
  expect(manyBlock!.statements).toHaveLength(2);
  expect(singleBlock!.statements).toHaveLength(1);
});

test("unchecked block statement", () => {
  const emptyBlock = getAst("unchecked {}", parseStatement) as Ast.UncheckedBlockStatement;
  const singleBlock = getAst("unchecked {a;}", parseStatement) as Ast.UncheckedBlockStatement;
  const manyBlock = getAst("unchecked { a; b; }", parseStatement) as Ast.UncheckedBlockStatement;

  expect(emptyBlock!.ast).toBe(Ast.disc.UncheckedBlockStatement);
  expect(singleBlock!.ast).toBe(Ast.disc.UncheckedBlockStatement);
  expect(manyBlock!.ast).toBe(Ast.disc.UncheckedBlockStatement);

  expect(emptyBlock!.statements).toHaveLength(0);
  expect(singleBlock!.statements).toHaveLength(1);
  expect(manyBlock!.statements).toHaveLength(2);
});

test.todo("if statement", () => {
  const _if = getAst("if (a) { b; }", parseStatement);
  const _ifElse = getAst("if (a) { b; } else { c; }", parseStatement);

  expect(_if!.ast).toBe(Ast.disc.IfStatement);
  expect(_ifElse!.ast).toBe(Ast.disc.IfStatement);
});

test.todo("for statement", () => {});

test.todo("while statement", () => {
  const _while = getAst("while (a) { b; }", parseStatement);
  expect(_while!.ast).toBe(Ast.disc.WhileStatement);
});

test.todo("do while statement");

test("break statement", () => {
  const _break = getAst("break;", parseStatement);
  expect(_break!.ast).toBe(Ast.disc.BreakStatement);
});

test("continue statement", () => {
  const _continue = getAst("continue;", parseStatement);
  expect(_continue!.ast).toBe(Ast.disc.ContinueStatement);
});

test("emit statement", () => {
  const emit = getAst("emit Log();", parseStatement);
  expect(emit!.ast).toBe(Ast.disc.EmitStatement);
});

test("revert statement", () => {
  const revert = getAst("revert Error();", parseStatement);
  expect(revert!.ast).toBe(Ast.disc.RevertStatement);
});

test("return statement", () => {
  const _return = getAst("return;", parseStatement);
  const _returnExpression = getAst("return a;", parseStatement);

  expect(_return!.ast).toBe(Ast.disc.ReturnStatement);
  expect(_returnExpression!.ast).toBe(Ast.disc.ReturnStatement);
});

test.todo("placehoder statement", () => {
  const placeholder = getAst("_;", parseStatement);
  expect(placeholder!.ast).toBe(Ast.disc.PlaceholderStatement);
});

test("variable declaration", () => {
  const noInitializer = getAst("uint256 a;", parseStatement) as Ast.VariableDeclaration;
  const initializer = getAst("uint256 a = 0;", parseStatement) as Ast.VariableDeclaration;
  const location = getAst("uint256 memory a;", parseStatement) as Ast.VariableDeclaration;

  // TODO(kyle) attributes

  expect(noInitializer!.ast).toBe(Ast.disc.VariableDeclaration);
  expect(initializer!.ast).toBe(Ast.disc.VariableDeclaration);
  expect(location!.ast).toBe(Ast.disc.VariableDeclaration);

  expect(initializer!.initializer).toBeDefined();
});

test("event definition", () => {
  const event = getAst("event Event();", parseEventDefinition);
  expect(event.ast).toBe(Ast.disc.EventDefinition);
});

test("error definition", () => {
  const error = getAst("error Error();", parseErrorDefinition);
  expect(error.ast).toBe(Ast.disc.ErrorDefinition);
});

test("contract definition", () => {
  const contract = getAst("contract C {}", parseContractDefinition);
  expect(contract.ast).toBe(Ast.disc.ContractDefinition);
});

test("function definition", () => {
  getAst("function fn() external {}", parseFunctionDefinition);
  getAst("function fn() external view {}", parseFunctionDefinition);
  getAst("function fn() view external {}", parseFunctionDefinition);
  getAst("function fn(uint256 a) external {}", parseFunctionDefinition);
});

test.todo("struct definition");

test.todo("modifier definition");

test("integration", async () => {
  let source = await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text();
  parse(source, tokenize(source));
  source = await Bun.file(path.join(import.meta.dir, "_sol", "GetBalance.sol")).text();
  parse(source, tokenize(source));
});
