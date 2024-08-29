import type { Token } from "./token";

export namespace Ast {
  export enum disc {
    Identifier,
    Literal,
    Assignment,
    UnaryOperation,
    BinaryOperation,
    ConditionalExpression,
    FunctionCallExpression,
    MemberAccessExpression,
    IndexAccessExpression,
    NewExpression,
    TupleExpression,
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
    VariableDefinition,
    VariableDeclaration,
    Parameter,
    FunctionDefinition,
    ContractDefinition,
    EventDefinition,
    ErrorDefinition,
    StructDefinition,
    ModifierDefinition,
  }

  // expressions

  export type Identifier = {
    ast: disc.Identifier;
    token: Token.Identifier | ElementaryType["type"];
  };

  export type Literal = {
    ast: disc.Literal;
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
    ast: disc.Assignment;
    operator:
      | Token.Assign
      | Token.AddAssign
      | Token.SubtractAssign
      | Token.MulAssign
      | Token.DivideAssign
      | Token.ModuloAssign
      | Token.BitwiseAndAssign
      | Token.BitwiseOrAssign
      | Token.BitwiseXOrAssign
      | Token.ShiftRightAssign
      | Token.ShiftLeftAssign;
    left: Expression;
    right: Expression;
  };

  // TODO(kyle) prefix or postfix
  export type UnaryOperation = {
    ast: disc.UnaryOperation;
    operator:
      | Token.Increment
      | Token.Decrement
      | Token.Subtract
      | Token.Delete
      | Token.Not
      | Token.BitwiseNot;
    expression: Expression;
    prefix: boolean;
  };

  export type BinaryOperation = {
    ast: disc.BinaryOperation;
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
    ast: disc.ConditionalExpression;
    condition: Expression;
    trueExpression: Expression;
    falseExpression: Expression;
  };

  export type FunctionCallExpression = {
    ast: disc.FunctionCallExpression;
    expression: Expression;
    arguments: Expression[];
  };

  export type MemberAccessExpression = {
    ast: disc.MemberAccessExpression;
    expression: Expression;
    member: Identifier;
  };

  export type IndexAccessExpression = {
    ast: disc.IndexAccessExpression;
    base: Expression;
    index: Expression;
  };

  export type NewExpression = {
    ast: disc.NewExpression;
    expression: Expression;
  };

  export type TupleExpression = {
    ast: disc.TupleExpression;
    elements: Expression[];
  };

  // statements

  export type ExpressionStatement = {
    ast: disc.ExpressionStatement;
    expression: Expression;
  };

  export type BlockStatement = {
    ast: disc.BlockStatement;
    statements: Statement[];
  };

  export type UncheckedBlockStatement = {
    ast: disc.UncheckedBlockStatement;
    statements: Statement[];
  };

  export type IfStatement = {
    ast: disc.IfStatement;
    condition: Expression;
    trueBody: Statement;
    falseBody: Statement | undefined;
  };

  export type ForStatement = {
    ast: disc.ForStatement;
    body: Statement;
    init: Expression | undefined;
    test: Expression | undefined;
    update: Expression | undefined;
  };

  export type WhileStatement = {
    ast: disc.WhileStatement;
    body: Statement;
    test: Expression;
  };

  export type DoWhileStatement = {
    ast: disc.DoWhileStatement;
    body: Statement;
    test: Expression;
  };

  export type BreakStatement = {
    ast: disc.BreakStatement;
  };

  export type ContinueStatement = {
    ast: disc.ContinueStatement;
  };

  export type EmitStatement = {
    ast: disc.EmitStatement;
    event: FunctionCallExpression;
  };

  export type RevertStatement = {
    ast: disc.RevertStatement;
    error: FunctionCallExpression;
  };

  export type ReturnStatement = {
    ast: disc.ReturnStatement;
    expression: Expression | undefined;
  };

  export type PlaceholderStatement = {
    ast: disc.PlaceholderStatement;
  };

  // types

  export type ElementaryType = {
    ast: disc.ElementaryType;
    type:
      | Token.Address
      | Token.String
      | Token.Uint
      | Token.Int
      | Token.Byte
      | Token.Bytes
      | Token.Bool;
  };

  export type ArrayType = {
    ast: disc.ArrayType;
    length: Expression | undefined;
    type: Type;
  };

  export type Mapping = {
    ast: disc.Mapping;
    keyType: Type;
    keyName: Token.Identifier | undefined;
    valueType: Type;
    valueName: Token.Identifier | undefined;
  };

  // defintions

  /**
   * function modifier or contract inheritance specifier
   */
  type Base = {
    name: Identifier;
    args: Expression[];
  };

  export type VariableDefintion = {
    ast: disc.VariableDefinition;
    type: Type;
    identifier: Token.Identifier;
    isConstant: boolean;
    isImmutable: boolean;
    visibility: Visibility | undefined;
  };

  export type VariableDeclaration = {
    ast: disc.VariableDeclaration;
    type: Type;
    identifier: Token.Identifier;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    initializer: Expression | undefined;
  };

  export type Parameter = {
    ast: disc.Parameter;
    type: Type;
    identifier: Token.Identifier | undefined;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    isIndexed: boolean;
  };

  export type FunctionDefinition = {
    ast: Ast.disc.FunctionDefinition;
    kind: Token.Function | Token.Receive | Token.Constructor | Token.Fallback;
    visibility: Visibility;
    mutability: Mutability;
    modifiers: Base[];
    parameters: Parameter[];
    returns: Parameter[];
    name: Token.Identifier | undefined;
    body: BlockStatement | undefined;
  };

  export type ContractDefinition = {
    ast: Ast.disc.ContractDefinition;
    kind: Token.Contract | Token.Interface | Token.Library;
    name: Token.Identifier;
    nodes: (
      | FunctionDefinition
      | StructDefinition
      | VariableDefintion
      | EventDefinition
      | ErrorDefinition
      | ModifierDefinition
    )[];
  };

  export type EventDefinition = {
    ast: disc.EventDefinition;
    name: Token.Identifier;
    parameters: Parameter[];
  };

  export type ErrorDefinition = {
    ast: disc.ErrorDefinition;
    name: Token.Identifier;
    parameters: Parameter[];
  };

  export type StructDefinition = {
    ast: disc.StructDefinition;
    name: Token.Identifier;
    members: Parameter[];
  };

  export type ModifierDefinition = {
    ast: disc.ModifierDefinition;
    name: Token.Identifier;
    body: BlockStatement;
    visibility: Visibility;
    parameters: Parameter[];
  };

  export type Visibility = Token.External | Token.Public | Token.Internal | Token.Private;
  export type Mutability = Token.Pure | Token.View | Token.Payable | Token.Nonpayable;

  export type Expression =
    | Identifier
    | Literal
    | Assignment
    | UnaryOperation
    | BinaryOperation
    | ConditionalExpression
    | FunctionCallExpression
    | MemberAccessExpression
    | IndexAccessExpression
    | NewExpression
    | TupleExpression;

  export type Statement =
    | VariableDeclaration
    | ExpressionStatement
    | BlockStatement
    | UncheckedBlockStatement
    | IfStatement
    | ForStatement
    | WhileStatement
    | DoWhileStatement
    | BreakStatement
    | ContinueStatement
    | EmitStatement
    | RevertStatement
    | ReturnStatement
    | PlaceholderStatement;

  export type Type = ElementaryType | ArrayType | Mapping;

  export type Definition =
    | VariableDefintion
    | FunctionDefinition
    | ContractDefinition
    | EventDefinition
    | ErrorDefinition
    | StructDefinition
    | ModifierDefinition;

  export type Program = Definition[];
}

/**
 * Not Implemented
 *
 * functionCallBlock
 * ArrayIndexRange
 * UserDefinedType
 * functionType
 * enum
 */
