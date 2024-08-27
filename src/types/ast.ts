import type { Token } from "./token";

export namespace Ast {
  export enum AstType {
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
    ast: AstType.Identifier;
    token: Token.Identifier | ElementaryType["type"];
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
    ast: AstType.UnaryOperation;
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
    index: Expression;
  };

  export type NewExpression = {
    ast: AstType.NewExpression;
    expression: Expression;
  };

  export type TupleExpression = {
    ast: AstType.TupleExpression;
    elements: Expression[];
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
      | Token.Address
      | Token.String
      | Token.Uint
      | Token.Int
      | Token.Byte
      | Token.Bytes
      | Token.Bool;
  };

  export type ArrayType = {
    ast: AstType.ArrayType;
    length: Expression | undefined;
    type: Type;
  };

  export type Mapping = {
    ast: AstType.Mapping;
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
    ast: AstType.VariableDefinition;
    type: Type;
    identifier: Token.Identifier;
    isConstant: boolean;
    isImmutable: boolean;
    visibility: Visibility | undefined;
  };

  export type VariableDeclaration = {
    ast: AstType.VariableDeclaration;
    type: Type;
    identifier: Token.Identifier;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    initializer: Expression | undefined;
  };

  export type Parameter = {
    ast: AstType.Parameter;
    type: Type;
    identifier: Token.Identifier | undefined;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    isIndexed: boolean;
  };

  export type FunctionDefinition = {
    ast: Ast.AstType.FunctionDefinition;
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
    ast: Ast.AstType.ContractDefinition;
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
    ast: AstType.EventDefinition;
    name: Token.Identifier;
    parameters: Parameter[];
  };

  export type ErrorDefinition = {
    ast: AstType.ErrorDefinition;
    name: Token.Identifier;
    parameters: Parameter[];
  };

  export type StructDefinition = {
    ast: AstType.StructDefinition;
    name: Token.Identifier;
    members: Parameter[];
  };

  export type ModifierDefinition = {
    ast: AstType.ModifierDefinition;
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
