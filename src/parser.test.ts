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
      throw new NotImplementedError({ source: "expressionToString" });
  }
};

// expressions

test("identifier", () => {
  const identifier = parseExpression({
    tokens: tokenize("id"),
    tokenIndex: 0,
  }) as Ast.Identifier | undefined;

  expect(identifier!.ast).toBe(Ast.disc.Identifier);
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
  expect(numberLiteral!.ast).toBe(Ast.disc.Literal);
  // expect(rationalNumberLiteral!.ast).toBe(Ast.AstType.Literal);
  expect(boolLiteral!.ast).toBe(Ast.disc.Literal);
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
  const incrementPostfix = parseExpression({ tokens: tokenize("id++"), tokenIndex: 0 });
  const decrementPostfix = parseExpression({ tokens: tokenize("id--"), tokenIndex: 0 });
  const incrementPrefix = parseExpression({ tokens: tokenize("++id"), tokenIndex: 0 });
  const decrementPrefix = parseExpression({ tokens: tokenize("--id"), tokenIndex: 0 });
  const subtract = parseExpression({ tokens: tokenize("-id"), tokenIndex: 0 });
  const _delete = parseExpression({ tokens: tokenize("delete id"), tokenIndex: 0 });
  const not = parseExpression({ tokens: tokenize("!id"), tokenIndex: 0 });
  const bitwiseNot = parseExpression({ tokens: tokenize("~id"), tokenIndex: 0 });

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

  expression = parseExpression({ tokens: tokenize("a + b + c"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(+ (+ a b) c)");

  expression = parseExpression({ tokens: tokenize("a + b * c * d + e"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(+ (+ a (* (* b c) d)) e)");
});

test("conditional expression", () => {
  const conditional = parseExpression({ tokens: tokenize("a ? b : c"), tokenIndex: 0 });
  expect(conditional!.ast).toBe(Ast.disc.ConditionalExpression);
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
  const memberAccess = parseExpression({ tokens: tokenize("a.b"), tokenIndex: 0 }) as
    | Ast.MemberAccessExpression
    | undefined;
  expect(memberAccess!.ast).toBe(Ast.disc.MemberAccessExpression);
  expect(memberAccess!.expression.ast).toBe(Ast.disc.Identifier);
  expect(memberAccess!.member.ast).toBe(Ast.disc.Identifier);

  const expression = parseExpression({ tokens: tokenize("a.b.c"), tokenIndex: 0 })!;
  expect(expressionToString(expression)).toBe("(. (. a b) c)");
});

test("index access expression", () => {
  const indexAccess = parseExpression({ tokens: tokenize("a[0]"), tokenIndex: 0 }) as
    | Ast.IndexAccessExpression
    | undefined;
  expect(indexAccess!.ast).toBe(Ast.disc.IndexAccessExpression);
  expect(indexAccess!.base.ast).toBe(Ast.disc.Identifier);
  expect(indexAccess!.index.ast).toBe(Ast.disc.Literal);
});

test("new expression", () => {
  const _new = parseExpression({ tokens: tokenize("new Contract()"), tokenIndex: 0 });
  expect(_new!.ast).toBe(Ast.disc.NewExpression);
});

test("tuple expression", () => {
  const tuple = parseExpression({ tokens: tokenize("(a,b,c)"), tokenIndex: 0 }) as
    | Ast.TupleExpression
    | undefined;
  expect(tuple!.ast).toBe(Ast.disc.TupleExpression);
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

  expect(emptyBlock!.ast).toBe(Ast.disc.BlockStatement);
  expect(singleBlock!.ast).toBe(Ast.disc.BlockStatement);
  expect(manyBlock!.ast).toBe(Ast.disc.BlockStatement);

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

  expect(emptyBlock!.ast).toBe(Ast.disc.UncheckedBlockStatement);
  expect(singleBlock!.ast).toBe(Ast.disc.UncheckedBlockStatement);
  expect(manyBlock!.ast).toBe(Ast.disc.UncheckedBlockStatement);

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

  expect(_if!.ast).toBe(Ast.disc.IfStatement);
  expect(_ifElse!.ast).toBe(Ast.disc.IfStatement);
});

test.todo("for statement", () => {});

test.todo("while statement", () => {
  const _while = parseStatement({ tokens: tokenize("while (a) { b; }"), tokenIndex: 0 });
  expect(_while!.ast).toBe(Ast.disc.WhileStatement);
});

test.todo("do while statement");

test("break statement", () => {
  const _break = parseStatement({ tokens: tokenize("break;"), tokenIndex: 0 });
  expect(_break!.ast).toBe(Ast.disc.BreakStatement);
});

test("continue statement", () => {
  const _continue = parseStatement({ tokens: tokenize("continue;"), tokenIndex: 0 });
  expect(_continue!.ast).toBe(Ast.disc.ContinueStatement);
});

test("emit statement", () => {
  const emit = parseStatement({ tokens: tokenize("emit Log();"), tokenIndex: 0 });
  expect(emit!.ast).toBe(Ast.disc.EmitStatement);
});

test("revert statement", () => {
  const revert = parseStatement({ tokens: tokenize("revert Error();"), tokenIndex: 0 });
  expect(revert!.ast).toBe(Ast.disc.RevertStatement);
});

test("return statement", () => {
  const _return = parseStatement({ tokens: tokenize("return;"), tokenIndex: 0 });
  const _returnExpression = parseStatement({
    tokens: tokenize("return a;"),
    tokenIndex: 0,
  });

  expect(_return!.ast).toBe(Ast.disc.ReturnStatement);
  expect(_returnExpression!.ast).toBe(Ast.disc.ReturnStatement);
});

test.todo("placehoder statement", () => {
  const placeholder = parseStatement({ tokens: tokenize("_;"), tokenIndex: 0 });
  expect(placeholder!.ast).toBe(Ast.disc.PlaceholderStatement);
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

  expect(noInitializer!.ast).toBe(Ast.disc.VariableDeclaration);
  expect(initializer!.ast).toBe(Ast.disc.VariableDeclaration);
  expect(location!.ast).toBe(Ast.disc.VariableDeclaration);

  expect(initializer!.initializer).toBeDefined();
});

test("event definition", () => {
  const event = parseEventDefinition({ tokens: tokenize("event Event();"), tokenIndex: 0 });
  expect(event.ast).toBe(Ast.disc.EventDefinition);
});

test("error definition", () => {
  const error = parseErrorDefinition({ tokens: tokenize("error Error();"), tokenIndex: 0 });
  expect(error.ast).toBe(Ast.disc.ErrorDefinition);
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
  parse(tokenize(await Bun.file(path.join(import.meta.dir, "_sol", "GetBalance.sol")).text()));

  // tokenize(await Bun.file(path.join(import.meta.dir, "_sol", "Erc20.sol")).text());
});
