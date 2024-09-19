import type { Token } from "./token";
import type { SourceLocation } from "./utils";

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
    IndexRangeAccessExpression,
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
    PragmaDirective,
  }

  // expressions

  export type Identifier = {
    ast: disc.Identifier;
    loc: SourceLocation;
    token: Token.Identifier;
  };

  export type Literal = {
    ast: disc.Literal;
    loc: SourceLocation;
    token:
      | Token.StringLiteral
      | Token.AddressLiteral
      | Token.HexLiteral
      | Token.NumberLiteral
      | Token.HexNumberLiteral
      | Token.BoolLiteral;
  };

  export type Assignment = {
    ast: disc.Assignment;
    loc: SourceLocation;
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

  export type UnaryOperation = {
    ast: disc.UnaryOperation;
    loc: SourceLocation;
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
    loc: SourceLocation;
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
    loc: SourceLocation;
    condition: Expression;
    trueExpression: Expression;
    falseExpression: Expression;
  };

  export type FunctionCallExpression = {
    ast: disc.FunctionCallExpression;
    loc: SourceLocation;
    expression: Expression;
    arguments: Expression[];
  };

  export type MemberAccessExpression = {
    ast: disc.MemberAccessExpression;
    loc: SourceLocation;
    expression: Expression;
    member: Identifier;
  };

  export type IndexAccessExpression = {
    ast: disc.IndexAccessExpression;
    loc: SourceLocation;
    base: Expression;
    index: Expression;
  };

  export type IndexRangeAccessExpression = {
    ast: disc.IndexRangeAccessExpression;
    loc: SourceLocation;
    base: Expression;
    start: Expression | undefined;
    end: Expression | undefined;
  };

  export type NewExpression = {
    ast: disc.NewExpression;
    loc: SourceLocation;
    expression: Expression;
  };

  export type TupleExpression = {
    ast: disc.TupleExpression;
    loc: SourceLocation;
    elements: Expression[];
  };

  // statements

  export type ExpressionStatement = {
    ast: disc.ExpressionStatement;
    loc: SourceLocation;
    expression: Expression;
  };

  export type BlockStatement = {
    ast: disc.BlockStatement;
    loc: SourceLocation;
    statements: Statement[];
  };

  export type UncheckedBlockStatement = {
    ast: disc.UncheckedBlockStatement;
    loc: SourceLocation;
    statements: Statement[];
  };

  export type IfStatement = {
    ast: disc.IfStatement;
    loc: SourceLocation;
    condition: Expression;
    trueBody: Statement;
    falseBody: Statement | undefined;
  };

  export type ForStatement = {
    ast: disc.ForStatement;
    loc: SourceLocation;
    body: Statement;
    init: Expression | undefined;
    test: Expression | undefined;
    update: Expression | undefined;
  };

  export type WhileStatement = {
    ast: disc.WhileStatement;
    loc: SourceLocation;
    test: Expression;
    body: Statement;
  };

  export type DoWhileStatement = {
    ast: disc.DoWhileStatement;
    loc: SourceLocation;
    body: Statement;
    test: Expression;
  };

  export type BreakStatement = {
    ast: disc.BreakStatement;
    loc: SourceLocation;
  };

  export type ContinueStatement = {
    ast: disc.ContinueStatement;
    loc: SourceLocation;
  };

  export type EmitStatement = {
    ast: disc.EmitStatement;
    loc: SourceLocation;
    event: FunctionCallExpression;
  };

  export type RevertStatement = {
    ast: disc.RevertStatement;
    loc: SourceLocation;
    error: FunctionCallExpression;
  };

  export type ReturnStatement = {
    ast: disc.ReturnStatement;
    loc: SourceLocation;
    expression: Expression | undefined;
  };

  export type PlaceholderStatement = {
    ast: disc.PlaceholderStatement;
    loc: SourceLocation;
  };

  // types

  export type ElementaryType = {
    ast: disc.ElementaryType;
    loc: SourceLocation;
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
    loc: SourceLocation;
    length: Expression | undefined;
    type: Type;
  };

  export type Mapping = {
    ast: disc.Mapping;
    loc: SourceLocation;
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
    loc: SourceLocation;
    type: Type;
    identifier: Token.Identifier;
    isConstant: boolean;
    isImmutable: boolean;
    visibility: Visibility | undefined;
    initializer: Expression | undefined;
  };

  export type VariableDeclaration = {
    ast: disc.VariableDeclaration;
    loc: SourceLocation;
    declarations: {
      type: Type;
      identifier: Token.Identifier | undefined;
      location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    }[];
    initializer: Expression | undefined;
  };

  export type Parameter = {
    ast: disc.Parameter;
    loc: SourceLocation;
    type: Type;
    identifier: Token.Identifier | undefined;
    location: Token.Storage | Token.Memory | Token.Calldata | undefined;
    isIndexed: boolean;
  };

  export type FunctionDefinition = {
    ast: Ast.disc.FunctionDefinition;
    loc: SourceLocation;
    kind: Token.Function | Token.Receive | Token.Constructor | Token.Fallback;
    visibility: Visibility | undefined;
    mutability: Mutability | undefined;
    modifiers: Base[];
    parameters: Parameter[];
    returns: Parameter[];
    name: Token.Identifier | undefined;
    body: BlockStatement | undefined;
  };

  export type ContractDefinition = {
    ast: Ast.disc.ContractDefinition;
    loc: SourceLocation;
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
    loc: SourceLocation;
    name: Token.Identifier;
    parameters: Parameter[];
  };

  export type ErrorDefinition = {
    ast: disc.ErrorDefinition;
    loc: SourceLocation;
    name: Token.Identifier;
    parameters: Parameter[];
  };

  export type StructDefinition = {
    ast: disc.StructDefinition;
    loc: SourceLocation;
    name: Token.Identifier;
    members: Parameter[];
  };

  export type ModifierDefinition = {
    ast: disc.ModifierDefinition;
    loc: SourceLocation;
    name: Token.Identifier;
    body: BlockStatement;
    visibility: Visibility;
    parameters: Parameter[];
  };

  export type PragmaDirective = {
    ast: disc.PragmaDirective;
    loc: SourceLocation;
    version: string;
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
    | IndexRangeAccessExpression
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

  export type Directive = PragmaDirective;

  export type Program = (Definition | Directive)[];
}

/**
 * Not Implemented
 *
 * UserType
 * FunctionType
 * TryStatement
 * UserTypeDefintion
 * FunctionCallOptions
 * ImportDirective
 * UsingDirective
 * NamedFunctionParameters
 * Enum
 * Yul
 * Inheritance
 */
