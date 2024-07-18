import type { TODO } from "./utils";

export namespace Token {
  export enum TokenType {
    Identifier,
    StringLiteral,
    AddressLiteral,
    HexLiteral,
    NumberLiteral,
    RationalNumberLiteral,
    HexNumberLiteral,
    BoolLiteral,
    If,
    Else,
    While,
    Do,
    For,
    Break,
    Continue,
    Switch,
    Case,
    Default,
    Return,
    Calldata,
    Memory,
    Storage,
    Immutable,
    Constant,
    Contract,
    Abstract,
    Interface,
    Library,
    Pragma,
    Import,
    From,
    Using,
    As,
    Is,
    Function,
    External,
    Public,
    Internal,
    Private,
    View,
    Pure,
    Returns,
    Payable,
    Nonpayable,
    Virtual,
    Override,
    Constructor,
    Modifier,
    Receive,
    Fallback,
    Unchecked,
    Revert,
    Assert,
    Throw,
    Try,
    Catch,
    Event,
    Emit,
    Indexed,
    Anonymous,
    New,
    Delete,
    Struct,
    Enum,
    Type,
    Mapping,
    Address,
    String,
    Uint,
    Int,
    Byte,
    Bytes,
    Bool,
    Member,
    Comma,
    Question,
    OpenParenthesis,
    CloseParenthesis,
    OpenCurlyBrace,
    CloseCurlyBrace,
    OpenBracket,
    CloseBracket,
    Semicolon,
    Colon,
    Arrow,
    Placeholder,
    Assign,
    Add,
    AddAssign,
    Increment,
    Subtract,
    SubtractAssign,
    Decrement,
    Mul,
    MulAssign,
    Divide,
    DivideAssign,
    Modulo,
    ModuloAssign,
    Power,
    /** `&&` */
    And,
    /** `||` */
    Or,
    BitwiseOr,
    BitwiseOrAssign,
    BitwiseXOr,
    BitwiseXOrAssign,
    BitwiseAnd,
    BitwiseAndAssign,
    BitwiseNot,
    ShiftRight,
    ShiftRightAssign,
    ShiftLeft,
    ShiftLeftAssign,
    Equal,
    Not,
    NotEqual,
    Less,
    LessEqual,
    More,
    MoreEqual,
    Assembly,
    ColonAssign,
    YulArrow,
    Let,
    Leave,
    After,
    Alias,
    Apply,
    Auto,
    Byte_,
    Copyof,
    Define,
    Final,
    Implements,
    In,
    Inline,
    Macro,
    Match,
    Mutable,
    Null,
    Of,
    Partial,
    Promise,
    Reference,
    Relocatable,
    Sealed,
    Sizeof,
    Static,
    Supports,
    Typedef,
    Typeof,
    Var,
  }

  export type Identifier = { token: TokenType.Identifier; value: string };

  // literals

  export type StringLiteral = { token: TokenType.StringLiteral; value: TODO };
  export type AddressLiteral = { token: TokenType.AddressLiteral; value: TODO };
  export type HexLiteral = { token: TokenType.HexLiteral; value: TODO };
  export type NumberLiteral = { token: TokenType.NumberLiteral; value: bigint };
  export type RationalNumberLiteral = { token: TokenType.RationalNumberLiteral; value: TODO };
  export type HexNumberLiteral = { token: TokenType.HexNumberLiteral; value: TODO };
  export type BoolLiteral = { token: TokenType.BoolLiteral; value: boolean };

  // keywords

  export type If = { token: TokenType.If };
  export type Else = { token: TokenType.Else };
  export type While = { token: TokenType.While };
  export type Do = { token: TokenType.Do };
  export type For = { token: TokenType.For };
  export type Break = { token: TokenType.Break };
  export type Continue = { token: TokenType.Continue };
  export type Switch = { token: TokenType.Switch };
  export type Case = { token: TokenType.Case };
  export type Default = { token: TokenType.Default };
  export type Return = { token: TokenType.Return };

  export type Calldata = { token: TokenType.Calldata };
  export type Memory = { token: TokenType.Memory };
  export type Storage = { token: TokenType.Storage };
  export type Immutable = { token: TokenType.Immutable };
  export type Constant = { token: TokenType.Constant };

  export type Contract = { token: TokenType.Contract };
  export type Abstract = { token: TokenType.Abstract };
  export type Interface = { token: TokenType.Interface };
  export type Library = { token: TokenType.Library };

  export type Pragma = { token: TokenType.Pragma };
  export type Import = { token: TokenType.Import };
  export type From = { token: TokenType.From };
  export type Using = { token: TokenType.Using };
  export type As = { token: TokenType.As };
  export type Is = { token: TokenType.Is };

  export type Function = { token: TokenType.Function };
  export type External = { token: TokenType.External };
  export type Public = { token: TokenType.Public };
  export type Internal = { token: TokenType.Internal };
  export type Private = { token: TokenType.Private };
  export type View = { token: TokenType.View };
  export type Pure = { token: TokenType.Pure };
  export type Returns = { token: TokenType.Returns };
  export type Payable = { token: TokenType.Payable };
  export type Nonpayable = { token: TokenType.Nonpayable };
  export type Virtual = { token: TokenType.Virtual };
  export type Override = { token: TokenType.Override };

  export type Constructor = { token: TokenType.Constructor };
  export type Modifier = { token: TokenType.Modifier };
  export type Receive = { token: TokenType.Receive };
  export type Fallback = { token: TokenType.Fallback };
  export type Unchecked = { token: TokenType.Unchecked };

  export type Revert = { token: TokenType.Revert };
  export type Assert = { token: TokenType.Assert };
  export type Throw = { token: TokenType.Throw };

  export type Try = { token: TokenType.Try };
  export type Catch = { token: TokenType.Catch };

  export type Event = { token: TokenType.Event };
  export type Emit = { token: TokenType.Emit };
  export type Indexed = { token: TokenType.Indexed };
  export type Anonymous = { token: TokenType.Anonymous };

  export type New = { token: TokenType.New };
  export type Delete = { token: TokenType.Delete };

  // type keywords

  export type Struct = { token: TokenType.Struct };
  export type Enum = { token: TokenType.Enum };
  export type Type = { token: TokenType.Type };
  export type Mapping = { token: TokenType.Mapping };

  export type Address = { token: TokenType.Address };
  export type String = { token: TokenType.String };
  export type Uint = { token: TokenType.Uint; size: number };
  export type Int = { token: TokenType.Int; size: number };
  export type Byte = { token: TokenType.Byte; size: number };
  export type Bytes = { token: TokenType.Bytes };
  export type Bool = { token: TokenType.Bool };

  // symbols

  export type Member = { token: TokenType.Member };
  export type Comma = { token: TokenType.Comma };
  export type Question = { token: TokenType.Question };
  export type OpenParenthesis = { token: TokenType.OpenParenthesis };
  export type CloseParenthesis = { token: TokenType.CloseParenthesis };
  export type OpenCurlyBrace = { token: TokenType.OpenCurlyBrace };
  export type CloseCurlyBrace = { token: TokenType.CloseCurlyBrace };
  export type OpenBracket = { token: TokenType.OpenBracket };
  export type CloseBracket = { token: TokenType.CloseBracket };
  export type Semicolon = { token: TokenType.Semicolon };
  export type Colon = { token: TokenType.Colon };
  export type Arrow = { token: TokenType.Arrow };
  export type Placeholder = { token: TokenType.Placeholder };

  // operators

  export type Assign = { token: TokenType.Assign };
  export type Add = { token: TokenType.Add };
  export type AddAssign = { token: TokenType.AddAssign };
  export type Increment = { token: TokenType.Increment };
  export type Subtract = { token: TokenType.Subtract };
  export type SubtractAssign = { token: TokenType.SubtractAssign };
  export type Decrement = { token: TokenType.Decrement };
  export type Mul = { token: TokenType.Mul };
  export type MulAssign = { token: TokenType.MulAssign };
  export type Divide = { token: TokenType.Divide };
  export type DivideAssign = { token: TokenType.DivideAssign };
  export type Modulo = { token: TokenType.Modulo };
  export type ModuloAssign = { token: TokenType.ModuloAssign };
  export type Power = { token: TokenType.Power };
  export type And = { token: TokenType.And };
  export type Or = { token: TokenType.Or };

  // bitwise operators

  export type BitwiseOr = { token: TokenType.BitwiseOr };
  export type BitwiseOrAssign = { token: TokenType.BitwiseOrAssign };
  export type BitwiseXOr = { token: TokenType.BitwiseXOr };
  export type BitwiseXOrAssign = { token: TokenType.BitwiseXOrAssign };
  export type BitwiseAnd = { token: TokenType.BitwiseAnd };
  export type BitwiseAndAssign = { token: TokenType.BitwiseAndAssign };
  export type BitwiseNot = { token: TokenType.BitwiseNot };
  export type ShiftRight = { token: TokenType.ShiftRight };
  export type ShiftRightAssign = { token: TokenType.ShiftRightAssign };
  export type ShiftLeft = { token: TokenType.ShiftLeft };
  export type ShiftLeftAssign = { token: TokenType.ShiftLeftAssign };

  // comparisons

  export type Equal = { token: TokenType.Equal };
  export type Not = { token: TokenType.Not };
  export type NotEqual = { token: TokenType.NotEqual };
  export type Less = { token: TokenType.Less };
  export type LessEqual = { token: TokenType.LessEqual };
  export type More = { token: TokenType.More };
  export type MoreEqual = { token: TokenType.MoreEqual };

  // yul

  export type Assembly = { token: TokenType.Assembly };
  export type ColonAssign = { token: TokenType.ColonAssign };
  export type YulArrow = { token: TokenType.YulArrow };
  export type Let = { token: TokenType.Let };
  export type Leave = { token: TokenType.Leave };

  // abi
  // block
  // tx
  // keccak256
  // blockhash
  // blobhash
  // msg
  // gasleft
  // sha256
  // ripemd160
  // ecrecover
  // addmod
  // mulmod
  // this
  // super
  // selfdestruct

  export type Token =
    | Identifier
    | StringLiteral
    | AddressLiteral
    | HexLiteral
    | NumberLiteral
    | RationalNumberLiteral
    | HexNumberLiteral
    | BoolLiteral
    | If
    | Else
    | While
    | Do
    | For
    | Break
    | Continue
    | Switch
    | Case
    | Default
    | Return
    | Calldata
    | Memory
    | Storage
    | Immutable
    | Constant
    | Contract
    | Abstract
    | Interface
    | Library
    | Pragma
    | Import
    | From
    | Using
    | As
    | Is
    | Function
    | External
    | Public
    | Internal
    | Private
    | View
    | Pure
    | Returns
    | Payable
    | Nonpayable
    | Virtual
    | Override
    | Constructor
    | Modifier
    | Receive
    | Fallback
    | Unchecked
    | Revert
    | Assert
    | Throw
    | Try
    | Catch
    | Event
    | Emit
    | Indexed
    | Anonymous
    | New
    | Delete
    | Struct
    | Enum
    | Type
    | Mapping
    | Address
    | String
    | Uint
    | Int
    | Byte
    | Bytes
    | Bool
    | Member
    | Comma
    | Question
    | OpenParenthesis
    | CloseParenthesis
    | OpenCurlyBrace
    | CloseCurlyBrace
    | OpenBracket
    | CloseBracket
    | Semicolon
    | Colon
    | Arrow
    | Placeholder
    | Assign
    | Add
    | AddAssign
    | Increment
    | Subtract
    | SubtractAssign
    | Decrement
    | Mul
    | MulAssign
    | Divide
    | DivideAssign
    | Modulo
    | ModuloAssign
    | Power
    | And
    | Or
    | BitwiseOr
    | BitwiseOrAssign
    | BitwiseXOr
    | BitwiseXOrAssign
    | BitwiseAnd
    | BitwiseAndAssign
    | BitwiseNot
    | ShiftRight
    | ShiftRightAssign
    | ShiftLeft
    | ShiftLeftAssign
    | Equal
    | Not
    | NotEqual
    | Less
    | LessEqual
    | More
    | MoreEqual
    | Assembly
    | ColonAssign
    | YulArrow
    | Let
    | Leave;
}
