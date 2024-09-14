import type { SourceLocation } from "./utils";

export namespace Token {
  export enum disc {
    Identifier,
    StringLiteral,
    AddressLiteral,
    HexLiteral,
    NumberLiteral,
    HexNumberLiteral,
    BoolLiteral,
    Version,
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
    And,
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

  export type Identifier = { token: disc.Identifier; loc: SourceLocation; value: string };

  // literals

  export type StringLiteral = { token: disc.StringLiteral; loc: SourceLocation; value: string };
  export type AddressLiteral = { token: disc.AddressLiteral; loc: SourceLocation; value: string };
  export type HexLiteral = { token: disc.HexLiteral; loc: SourceLocation; value: string };
  export type NumberLiteral = { token: disc.NumberLiteral; loc: SourceLocation; value: string };
  export type HexNumberLiteral = {
    token: disc.HexNumberLiteral;
    loc: SourceLocation;
    value: string;
  };
  export type BoolLiteral = { token: disc.BoolLiteral; loc: SourceLocation; value: string };

  export type Version = { token: disc.Version; loc: SourceLocation; value: string };

  // keywords

  export type If = { token: disc.If; loc: SourceLocation };
  export type Else = { token: disc.Else; loc: SourceLocation };
  export type While = { token: disc.While; loc: SourceLocation };
  export type Do = { token: disc.Do; loc: SourceLocation };
  export type For = { token: disc.For; loc: SourceLocation };
  export type Break = { token: disc.Break; loc: SourceLocation };
  export type Continue = { token: disc.Continue; loc: SourceLocation };
  export type Switch = { token: disc.Switch; loc: SourceLocation };
  export type Case = { token: disc.Case; loc: SourceLocation };
  export type Default = { token: disc.Default; loc: SourceLocation };
  export type Return = { token: disc.Return; loc: SourceLocation };

  export type Calldata = { token: disc.Calldata; loc: SourceLocation };
  export type Memory = { token: disc.Memory; loc: SourceLocation };
  export type Storage = { token: disc.Storage; loc: SourceLocation };
  export type Immutable = { token: disc.Immutable; loc: SourceLocation };
  export type Constant = { token: disc.Constant; loc: SourceLocation };

  export type Contract = { token: disc.Contract; loc: SourceLocation };
  export type Abstract = { token: disc.Abstract; loc: SourceLocation };
  export type Interface = { token: disc.Interface; loc: SourceLocation };
  export type Library = { token: disc.Library; loc: SourceLocation };

  export type Pragma = { token: disc.Pragma; loc: SourceLocation };
  export type Import = { token: disc.Import; loc: SourceLocation };
  export type From = { token: disc.From; loc: SourceLocation };
  export type Using = { token: disc.Using; loc: SourceLocation };
  export type As = { token: disc.As; loc: SourceLocation };
  export type Is = { token: disc.Is; loc: SourceLocation };

  export type Function = { token: disc.Function; loc: SourceLocation };
  export type External = { token: disc.External; loc: SourceLocation };
  export type Public = { token: disc.Public; loc: SourceLocation };
  export type Internal = { token: disc.Internal; loc: SourceLocation };
  export type Private = { token: disc.Private; loc: SourceLocation };
  export type View = { token: disc.View; loc: SourceLocation };
  export type Pure = { token: disc.Pure; loc: SourceLocation };
  export type Returns = { token: disc.Returns; loc: SourceLocation };
  export type Payable = { token: disc.Payable; loc: SourceLocation };
  export type Nonpayable = { token: disc.Nonpayable; loc: SourceLocation };
  export type Virtual = { token: disc.Virtual; loc: SourceLocation };
  export type Override = { token: disc.Override; loc: SourceLocation };

  export type Constructor = { token: disc.Constructor; loc: SourceLocation };
  export type Modifier = { token: disc.Modifier; loc: SourceLocation };
  export type Receive = { token: disc.Receive; loc: SourceLocation };
  export type Fallback = { token: disc.Fallback; loc: SourceLocation };
  export type Unchecked = { token: disc.Unchecked; loc: SourceLocation };

  export type Error = { token: disc.Error; loc: SourceLocation };
  export type Revert = { token: disc.Revert; loc: SourceLocation };
  export type Assert = { token: disc.Assert; loc: SourceLocation };
  export type Throw = { token: disc.Throw; loc: SourceLocation };

  export type Try = { token: disc.Try; loc: SourceLocation };
  export type Catch = { token: disc.Catch; loc: SourceLocation };

  export type Event = { token: disc.Event; loc: SourceLocation };
  export type Emit = { token: disc.Emit; loc: SourceLocation };
  export type Indexed = { token: disc.Indexed; loc: SourceLocation };
  export type Anonymous = { token: disc.Anonymous; loc: SourceLocation };

  export type New = { token: disc.New; loc: SourceLocation };
  export type Delete = { token: disc.Delete; loc: SourceLocation };

  // type keywords

  export type Struct = { token: disc.Struct; loc: SourceLocation };
  export type Enum = { token: disc.Enum; loc: SourceLocation };
  export type Type = { token: disc.Type; loc: SourceLocation };
  export type Mapping = { token: disc.Mapping; loc: SourceLocation };

  export type Address = { token: disc.Address; loc: SourceLocation };
  export type String = { token: disc.String; loc: SourceLocation };
  export type Uint = { token: disc.Uint; loc: SourceLocation; size: number };
  export type Int = { token: disc.Int; loc: SourceLocation; size: number };
  export type Byte = { token: disc.Byte; loc: SourceLocation; size: number };
  export type Bytes = { token: disc.Bytes; loc: SourceLocation };
  export type Bool = { token: disc.Bool; loc: SourceLocation };

  // symbols

  /** `.` */
  export type Member = { token: disc.Member; loc: SourceLocation };
  /** `,` */
  export type Comma = { token: disc.Comma; loc: SourceLocation };
  /** `?` */
  export type Question = { token: disc.Question; loc: SourceLocation };
  /** `(` */
  export type OpenParenthesis = { token: disc.OpenParenthesis; loc: SourceLocation };
  /** `)` */
  export type CloseParenthesis = { token: disc.CloseParenthesis; loc: SourceLocation };
  /** `{` */
  export type OpenCurlyBrace = { token: disc.OpenCurlyBrace; loc: SourceLocation };
  /** `}` */
  export type CloseCurlyBrace = { token: disc.CloseCurlyBrace; loc: SourceLocation };
  /** `[` */
  export type OpenBracket = { token: disc.OpenBracket; loc: SourceLocation };
  /** `]` */
  export type CloseBracket = { token: disc.CloseBracket; loc: SourceLocation };
  /** `;` */
  export type Semicolon = { token: disc.Semicolon; loc: SourceLocation };
  /** `:` */
  export type Colon = { token: disc.Colon; loc: SourceLocation };
  /** `=>` */
  export type Arrow = { token: disc.Arrow; loc: SourceLocation };
  /** `_` */
  export type Placeholder = { token: disc.Placeholder; loc: SourceLocation };

  // operators

  /** `=` */
  export type Assign = { token: disc.Assign; loc: SourceLocation };
  /** `+` */
  export type Add = { token: disc.Add; loc: SourceLocation };
  /** `+=` */
  export type AddAssign = { token: disc.AddAssign; loc: SourceLocation };
  /** `++` */
  export type Increment = { token: disc.Increment; loc: SourceLocation };
  /** `-` */
  export type Subtract = { token: disc.Subtract; loc: SourceLocation };
  /** `-=` */
  export type SubtractAssign = { token: disc.SubtractAssign; loc: SourceLocation };
  /** `--` */
  export type Decrement = { token: disc.Decrement; loc: SourceLocation };
  /** `*` */
  export type Mul = { token: disc.Mul; loc: SourceLocation };
  /** `*=` */
  export type MulAssign = { token: disc.MulAssign; loc: SourceLocation };
  /** `/` */
  export type Divide = { token: disc.Divide; loc: SourceLocation };
  /** `/=` */
  export type DivideAssign = { token: disc.DivideAssign; loc: SourceLocation };
  /** `%` */
  export type Modulo = { token: disc.Modulo; loc: SourceLocation };
  /** `%=` */
  export type ModuloAssign = { token: disc.ModuloAssign; loc: SourceLocation };
  /** `**` */
  export type Power = { token: disc.Power; loc: SourceLocation };
  /** `&&` */
  export type And = { token: disc.And; loc: SourceLocation };
  /** `||` */
  export type Or = { token: disc.Or; loc: SourceLocation };

  // bitwise operators

  /** `|` */
  export type BitwiseOr = { token: disc.BitwiseOr; loc: SourceLocation };
  /** `|=` */
  export type BitwiseOrAssign = { token: disc.BitwiseOrAssign; loc: SourceLocation };
  /** `^` */
  export type BitwiseXOr = { token: disc.BitwiseXOr; loc: SourceLocation };
  /** `^=` */
  export type BitwiseXOrAssign = { token: disc.BitwiseXOrAssign; loc: SourceLocation };
  /** `&` */
  export type BitwiseAnd = { token: disc.BitwiseAnd; loc: SourceLocation };
  /** `&=` */
  export type BitwiseAndAssign = { token: disc.BitwiseAndAssign; loc: SourceLocation };
  /** `~` */
  export type BitwiseNot = { token: disc.BitwiseNot; loc: SourceLocation };
  /** `>>` */
  export type ShiftRight = { token: disc.ShiftRight; loc: SourceLocation };
  /** `>>=` */
  export type ShiftRightAssign = { token: disc.ShiftRightAssign; loc: SourceLocation };
  /** `<<` */
  export type ShiftLeft = { token: disc.ShiftLeft; loc: SourceLocation };
  /** `<<=` */
  export type ShiftLeftAssign = { token: disc.ShiftLeftAssign; loc: SourceLocation };

  // comparisons

  /** `==` */
  export type Equal = { token: disc.Equal; loc: SourceLocation };
  /** `!` */
  export type Not = { token: disc.Not; loc: SourceLocation };
  /** `!=` */
  export type NotEqual = { token: disc.NotEqual; loc: SourceLocation };
  /** `<` */
  export type Less = { token: disc.Less; loc: SourceLocation };
  /** `<=` */
  export type LessEqual = { token: disc.LessEqual; loc: SourceLocation };
  /** `>` */
  export type More = { token: disc.More; loc: SourceLocation };
  /** `>=` */
  export type MoreEqual = { token: disc.MoreEqual; loc: SourceLocation };

  // yul

  export type Assembly = { token: disc.Assembly; loc: SourceLocation };
  /** `:=` */
  export type ColonAssign = { token: disc.ColonAssign; loc: SourceLocation };
  /** `->` */
  export type YulArrow = { token: disc.YulArrow; loc: SourceLocation };
  export type Let = { token: disc.Let; loc: SourceLocation };
  export type Leave = { token: disc.Leave; loc: SourceLocation };

  export type Token =
    | Identifier
    | StringLiteral
    | AddressLiteral
    | HexLiteral
    | NumberLiteral
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
