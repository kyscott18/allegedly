import type { Token } from "./token";

export namespace Ast {
  export enum AstType {
    Identifier,
    Literal,
    Assignment,
    UnaryOperation,
    BinaryOperation,
    LogicalExpression,
    ConditionalExpression,
    FunctionCallExpression,
    MemberAccessExpression,
    IndexAccessExpression,
    NewExpression,
    TupleExpression,
    VariableDeclaration,
    ExpressionStatement,
    BlockStatement,
    UncheckedBlockStatement,
    IfStatement,
    ForStatement,
    WhileStatement,
    DoWhileStatement,
    BreakStatement,
    ContinueStatement,
    EmitStatement,
    RevertStatement,
    ReturnStatement,
    PlaceholderStatement,
    ElementaryType,
    ArrayType,
    Mapping,
    FunctionDefinition,
    ContractDefinition,
    EventDefinition,
    ErrorDefinition,
    StructDefinition,
    ModifierDefinition,
  }

  // expressions

  export type Identifier = {
    ast: AstType.Identifier;
    token: Token.Identifier;
  };

  export type Literal = {
    ast: AstType.Literal;
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
    ast: AstType.Assignment;
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
    ast: AstType.UnaryOperation;
    operator: Token.Increment | Token.Decrement | Token.Subtract | Token.Delete;
    expression: Expression;
  };

  export type BinaryOperation = {
    ast: AstType.BinaryOperation;
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
      | Token.MoreEqual
      | Token.BitwiseAnd
      | Token.BitwiseOr
      | Token.BitwiseXOr
      | Token.ShiftRight
      | Token.ShiftLeft;
    left: Expression;
    right: Expression;
  };

  export type ConditionalExpression = {
    ast: AstType.ConditionalExpression;
    condition: Expression;
    trueExpression: Expression;
    falseExpression: Expression;
  };

  export type FunctionCallExpression = {
    ast: AstType.FunctionCallExpression;
    expression: Expression;
    arguments: Expression[];
  };

  export type MemberAccessExpression = {
    ast: AstType.MemberAccessExpression;
    expression: Expression;
    member: Identifier;
  };

  export type IndexAccessExpression = {
    ast: AstType.IndexAccessExpression;
    base: Expression;
    index: Expression | undefined;
  };

  export type NewExpression = {
    ast: AstType.NewExpression;
    expression: Expression;
  };

  export type TupleExpression = {
    ast: AstType.TupleExpression;
    elements: Expression[];
  };

  type VariableAttributes = Visibility | Token.Constant | Token.Override;

  export type VariableDeclaration = {
    ast: AstType.VariableDeclaration;
    type: Token.Address | Token.String | Token.Uint | Token.Int | Token.Bytes | Token.Bool;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    attributes: VariableAttributes[];
    identifier: Token.Identifier;
    initializer: Expression | undefined;
  };

  // statements

  export type ExpressionStatement = {
    ast: AstType.ExpressionStatement;
    expression: Expression;
  };

  export type BlockStatement = {
    ast: AstType.BlockStatement;
    statements: Statement[];
  };

  export type UncheckedBlockStatement = {
    ast: AstType.UncheckedBlockStatement;
    statements: Statement[];
  };

  export type IfStatement = {
    ast: AstType.IfStatement;
    condition: Expression;
    trueBody: Statement;
    falseBody: Statement | undefined;
  };

  export type ForStatement = {
    ast: AstType.ForStatement;
    body: Statement;
    init: Expression | undefined;
    test: Expression | undefined;
    update: Expression | undefined;
  };

  export type WhileStatement = {
    ast: AstType.WhileStatement;
    body: Statement;
    test: Expression;
  };

  export type DoWhileStatement = {
    ast: AstType.DoWhileStatement;
    body: Statement;
    test: Expression;
  };

  export type BreakStatement = {
    ast: AstType.BreakStatement;
  };

  export type ContinueStatement = {
    ast: AstType.ContinueStatement;
  };

  export type EmitStatement = {
    ast: AstType.EmitStatement;
    event: FunctionCallExpression;
  };

  export type RevertStatement = {
    ast: AstType.RevertStatement;
    error: FunctionCallExpression;
  };

  export type ReturnStatement = {
    ast: AstType.ReturnStatement;
    expression: Expression | undefined;
  };

  export type PlaceholderStatement = {
    ast: AstType.PlaceholderStatement;
  };

  // types

  export type ElementaryType = {
    ast: AstType.ElementaryType;
    type:
      | Token.TokenType.Address
      | Token.TokenType.String
      | Token.TokenType.Uint
      | Token.TokenType.Int
      | Token.TokenType.Byte
      | Token.TokenType.Bytes
      | Token.TokenType.Bool;
  };

  export type ArrayType = {
    ast: AstType.ArrayType;
    length: Expression | undefined;
    type: ElementaryType;
  };

  export type Mapping = {
    ast: AstType.Mapping;
    key: Expression;
    keyName: Identifier | undefined;
    value: Expression;
    valueName: Identifier | undefined;
  };

  // defintions

  /**
   * function modifier or contract inheritance specifier
   */
  type Base = {
    name: Identifier;
    args: Expression[];
  };

  type FunctionAttribute = Visibility | Mutability | Token.Virtual | Token.Override | Base;

  type Parameter = {
    type: Expression;
    storage: Token.Memory | Token.Storage | Token.Calldata | undefined;
    name: Identifier | undefined;
  };

  type ParameterList = (Parameter | undefined)[];

  export type FunctionDefinition = {
    ast: "functionDefinition";
    kind: Token.Function | Token.Receive | Token.Constructor | Token.Fallback;
    attributes: FunctionAttribute[];
    parameters: ParameterList;
    returns: ParameterList;
    name: Identifier | undefined;
    body: BlockStatement;
  };

  export type ContractDefinition = {
    ast: "contractDefintion";
    name: Identifier;
    kind: Token.Contract | Token.Interface | Token.Library;
    nodes: (
      | FunctionDefinition
      | StructDefinition
      | VariableDeclaration
      | EventDefinition
      | ErrorDefinition
      | ModifierDefinition
    )[];
  };

  export type EventDefinition = {
    ast: AstType.EventDefinition;
    name: Identifier;
    parameters: ParameterList;
  };

  export type ErrorDefinition = {
    ast: AstType.ErrorDefinition;
    name: Identifier;
    parameters: ParameterList;
  };

  export type StructDefinition = {
    ast: AstType.StructDefinition;
    name: Identifier;
    members: VariableDeclaration[];
  };

  export type ModifierDefinition = {
    ast: AstType.ModifierDefinition;
    name: Identifier;
    body: BlockStatement;
    visibility: Visibility;
    parameters: ParameterList;
  };

  type Visibility = Token.External | Token.Public | Token.Internal | Token.Private;
  type Mutability = Token.Pure | Token.View | Token.Payable;

  export type Expression =
    | Identifier
    | Literal
    | Assignment
    | UnaryOperation
    | BinaryOperation
    | VariableDeclaration;

  export type Statement = ExpressionStatement;

  export type Type = ElementaryType | ArrayType | Mapping;

  export type Definition =
    | FunctionDefinition
    | ContractDefinition
    | EventDefinition
    | ErrorDefinition
    | StructDefinition
    | ModifierDefinition;

  export type Program = Definition[];
}

/**
 * functionCallBlock
 * ArrayIndexRange
 * UserDefinedType
 * functionType
 * enum
 */
