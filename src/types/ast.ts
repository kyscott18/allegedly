import type { Token } from "./token";

// TODO(kyle) offset as proxy?

export namespace Ast {
  export type Identifier = {
    type: "identifier";
    token: Token.Identifier;
  };

  export type Literal = {
    type: "literal";
    token:
      | Token.StringLiteral
      | Token.AddressLiteral
      | Token.HexLiteral
      | Token.NumberLiteral
      | Token.RationalNumberLiteral
      | Token.HexNumberLiteral
      | Token.BoolLiteral;
  };

  export type Assignment = {
    type: "assignment";
    operator:
      | Token.Assign
      | Token.AddAssign
      | Token.SubtractAssign
      | Token.MulAssign
      | Token.DivideAssign
      | Token.ModuloAssign;
    left: Expression;
    right: Expression;
  };

  export type UnaryOperation = {
    type: "unaryOperation";
    operator: Token.Increment | Token.Decrement | Token.Subtract | Token.Delete;
    expression: Expression;
  };

  export type BinaryOperation = {
    type: "binaryOperation";
    operator:
      | Token.Add
      | Token.Subtract
      | Token.Mul
      | Token.Divide
      | Token.Modulo
      | Token.Power
      | Token.And
      | Token.Or
      | Token.Equal
      | Token.NotEqual
      | Token.Less
      | Token.LessEqual
      | Token.More
      | Token.MoreEqual;
    left: Expression;
    right: Expression;
  };

  type Visibility = Token.External | Token.Public | Token.Internal | Token.Private;

  type VariableAttributes = Visibility | Token.Constant | Token.Override;

  export type VariableDeclaration = {
    type: "variableDeclaration";
    ty: Token.Address | Token.String | Token.Uint | Token.Int | Token.Bytes | Token.Bool;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    attributes: VariableAttributes[];
    name: Token.Identifier;
    initializer: Expression | undefined;
  };

  export type ExpressionStatement = {
    type: "expressionStatement";
    expression: Expression;
  };

  export type Expression =
    | Identifier
    | Literal
    | Assignment
    | UnaryOperation
    | BinaryOperation
    | VariableDeclaration;
  export type Statement = ExpressionStatement;
  export type Program = Statement[];
}
