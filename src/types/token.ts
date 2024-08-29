import type { Hex } from "viem";
import type { TODO } from "./utils";

export namespace Token {
  export enum disc {
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
    Error,
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

  export type Identifier = { token: disc.Identifier; value: string };

  // literals

  export type StringLiteral = { token: disc.StringLiteral; value: TODO };
  export type AddressLiteral = { token: disc.AddressLiteral; value: Hex };
  export type HexLiteral = { token: disc.HexLiteral; value: TODO };
  export type NumberLiteral = { token: disc.NumberLiteral; value: bigint };
  export type RationalNumberLiteral = { token: disc.RationalNumberLiteral; value: TODO };
  export type HexNumberLiteral = { token: disc.HexNumberLiteral; value: TODO };
  export type BoolLiteral = { token: disc.BoolLiteral; value: boolean };

  // keywords

  export type If = { token: disc.If };
  export type Else = { token: disc.Else };
  export type While = { token: disc.While };
  export type Do = { token: disc.Do };
  export type For = { token: disc.For };
  export type Break = { token: disc.Break };
  export type Continue = { token: disc.Continue };
  export type Switch = { token: disc.Switch };
  export type Case = { token: disc.Case };
  export type Default = { token: disc.Default };
  export type Return = { token: disc.Return };

  export type Calldata = { token: disc.Calldata };
  export type Memory = { token: disc.Memory };
  export type Storage = { token: disc.Storage };
  export type Immutable = { token: disc.Immutable };
  export type Constant = { token: disc.Constant };

  export type Contract = { token: disc.Contract };
  export type Abstract = { token: disc.Abstract };
  export type Interface = { token: disc.Interface };
  export type Library = { token: disc.Library };

  export type Pragma = { token: disc.Pragma };
  export type Import = { token: disc.Import };
  export type From = { token: disc.From };
  export type Using = { token: disc.Using };
  export type As = { token: disc.As };
  export type Is = { token: disc.Is };

  export type Function = { token: disc.Function };
  export type External = { token: disc.External };
  export type Public = { token: disc.Public };
  export type Internal = { token: disc.Internal };
  export type Private = { token: disc.Private };
  export type View = { token: disc.View };
  export type Pure = { token: disc.Pure };
  export type Returns = { token: disc.Returns };
  export type Payable = { token: disc.Payable };
  export type Nonpayable = { token: disc.Nonpayable };
  export type Virtual = { token: disc.Virtual };
  export type Override = { token: disc.Override };

  export type Constructor = { token: disc.Constructor };
  export type Modifier = { token: disc.Modifier };
  export type Receive = { token: disc.Receive };
  export type Fallback = { token: disc.Fallback };
  export type Unchecked = { token: disc.Unchecked };

  export type Error = { token: disc.Error };
  export type Revert = { token: disc.Revert };
  export type Assert = { token: disc.Assert };
  export type Throw = { token: disc.Throw };

  export type Try = { token: disc.Try };
  export type Catch = { token: disc.Catch };

  export type Event = { token: disc.Event };
  export type Emit = { token: disc.Emit };
  export type Indexed = { token: disc.Indexed };
  export type Anonymous = { token: disc.Anonymous };

  export type New = { token: disc.New };
  export type Delete = { token: disc.Delete };

  // type keywords

  export type Struct = { token: disc.Struct };
  export type Enum = { token: disc.Enum };
  export type Type = { token: disc.Type };
  export type Mapping = { token: disc.Mapping };

  export type Address = { token: disc.Address };
  export type String = { token: disc.String };
  export type Uint = { token: disc.Uint; size: number };
  export type Int = { token: disc.Int; size: number };
  export type Byte = { token: disc.Byte; size: number };
  export type Bytes = { token: disc.Bytes };
  export type Bool = { token: disc.Bool };

  // symbols

  export type Member = { token: disc.Member };
  export type Comma = { token: disc.Comma };
  export type Question = { token: disc.Question };
  export type OpenParenthesis = { token: disc.OpenParenthesis };
  export type CloseParenthesis = { token: disc.CloseParenthesis };
  export type OpenCurlyBrace = { token: disc.OpenCurlyBrace };
  export type CloseCurlyBrace = { token: disc.CloseCurlyBrace };
  export type OpenBracket = { token: disc.OpenBracket };
  export type CloseBracket = { token: disc.CloseBracket };
  export type Semicolon = { token: disc.Semicolon };
  export type Colon = { token: disc.Colon };
  export type Arrow = { token: disc.Arrow };
  export type Placeholder = { token: disc.Placeholder };

  // operators

  export type Assign = { token: disc.Assign };
  export type Add = { token: disc.Add };
  export type AddAssign = { token: disc.AddAssign };
  export type Increment = { token: disc.Increment };
  export type Subtract = { token: disc.Subtract };
  export type SubtractAssign = { token: disc.SubtractAssign };
  export type Decrement = { token: disc.Decrement };
  export type Mul = { token: disc.Mul };
  export type MulAssign = { token: disc.MulAssign };
  export type Divide = { token: disc.Divide };
  export type DivideAssign = { token: disc.DivideAssign };
  export type Modulo = { token: disc.Modulo };
  export type ModuloAssign = { token: disc.ModuloAssign };
  export type Power = { token: disc.Power };
  export type And = { token: disc.And };
  export type Or = { token: disc.Or };

  // bitwise operators

  export type BitwiseOr = { token: disc.BitwiseOr };
  export type BitwiseOrAssign = { token: disc.BitwiseOrAssign };
  export type BitwiseXOr = { token: disc.BitwiseXOr };
  export type BitwiseXOrAssign = { token: disc.BitwiseXOrAssign };
  export type BitwiseAnd = { token: disc.BitwiseAnd };
  export type BitwiseAndAssign = { token: disc.BitwiseAndAssign };
  export type BitwiseNot = { token: disc.BitwiseNot };
  export type ShiftRight = { token: disc.ShiftRight };
  export type ShiftRightAssign = { token: disc.ShiftRightAssign };
  export type ShiftLeft = { token: disc.ShiftLeft };
  export type ShiftLeftAssign = { token: disc.ShiftLeftAssign };

  // comparisons

  export type Equal = { token: disc.Equal };
  export type Not = { token: disc.Not };
  export type NotEqual = { token: disc.NotEqual };
  export type Less = { token: disc.Less };
  export type LessEqual = { token: disc.LessEqual };
  export type More = { token: disc.More };
  export type MoreEqual = { token: disc.MoreEqual };

  // yul

  export type Assembly = { token: disc.Assembly };
  export type ColonAssign = { token: disc.ColonAssign };
  export type YulArrow = { token: disc.YulArrow };
  export type Let = { token: disc.Let };
  export type Leave = { token: disc.Leave };

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
    | Error
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
