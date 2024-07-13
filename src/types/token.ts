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
    And,
    Or,
    BitwiseOr,
    BitwiseOrAssign,
    BitwiseXOr,
    BitwiseXOrAssign,
    BitwiseAnd,
    BitwiseAndAssign,
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

  export type StringLiteral = { token: TokenType.StringLiteral; value: string };
  export type AddressLiteral = { token: TokenType.AddressLiteral; value: string };
  export type HexLiteral = { token: TokenType.HexLiteral; value: string };
  export type NumberLiteral = { token: TokenType.NumberLiteral; value: string };
  export type RationalNumberLiteral = { token: TokenType.RationalNumberLiteral; value: string };
  export type HexNumberLiteral = { token: TokenType.HexNumberLiteral; value: string };
  export type BoolLiteral = { token: TokenType.BoolLiteral; value: string };

  // keywords

  export type If = { token: TokenType.If; value: undefined };
  export type Else = { token: TokenType.Else; value: undefined };
  export type While = { token: TokenType.While; value: undefined };
  export type Do = { token: TokenType.Do; value: undefined };
  export type For = { token: TokenType.For; value: undefined };
  export type Break = { token: TokenType.Break; value: undefined };
  export type Continue = { token: TokenType.Continue; value: undefined };
  export type Switch = { token: TokenType.Switch; value: undefined };
  export type Case = { token: TokenType.Case; value: undefined };
  export type Default = { token: TokenType.Default; value: undefined };
  export type Return = { token: TokenType.Return; value: undefined };

  export type Calldata = { token: TokenType.Calldata; value: undefined };
  export type Memory = { token: TokenType.Memory; value: undefined };
  export type Storage = { token: TokenType.Storage; value: undefined };
  export type Immutable = { token: TokenType.Immutable; value: undefined };
  export type Constant = { token: TokenType.Constant; value: undefined };

  export type Contract = { token: TokenType.Contract; value: undefined };
  export type Abstract = { token: TokenType.Abstract; value: undefined };
  export type Interface = { token: TokenType.Interface; value: undefined };
  export type Library = { token: TokenType.Library; value: undefined };

  export type Pragma = { token: TokenType.Pragma; value: undefined };
  export type Import = { token: TokenType.Import; value: undefined };
  export type From = { token: TokenType.From; value: undefined };
  export type Using = { token: TokenType.Using; value: undefined };
  export type As = { token: TokenType.As; value: undefined };
  export type Is = { token: TokenType.Is; value: undefined };

  export type Function = { token: TokenType.Function; value: undefined };
  export type External = { token: TokenType.External; value: undefined };
  export type Public = { token: TokenType.Public; value: undefined };
  export type Internal = { token: TokenType.Internal; value: undefined };
  export type Private = { token: TokenType.Private; value: undefined };
  export type View = { token: TokenType.View; value: undefined };
  export type Pure = { token: TokenType.Pure; value: undefined };
  export type Returns = { token: TokenType.Returns; value: undefined };
  export type Payable = { token: TokenType.Payable; value: undefined };
  export type Nonpayable = { token: TokenType.Nonpayable; value: undefined };
  export type Virtual = { token: TokenType.Virtual; value: undefined };
  export type Override = { token: TokenType.Override; value: undefined };

  export type Constructor = { token: TokenType.Constructor; value: undefined };
  export type Modifier = { token: TokenType.Modifier; value: undefined };
  export type Receive = { token: TokenType.Receive; value: undefined };
  export type Fallback = { token: TokenType.Fallback; value: undefined };
  export type Unchecked = { token: TokenType.Unchecked; value: undefined };

  export type Revert = { token: TokenType.Revert; value: undefined };
  export type Assert = { token: TokenType.Assert; value: undefined };
  export type Throw = { token: TokenType.Throw; value: undefined };

  export type Try = { token: TokenType.Try; value: undefined };
  export type Catch = { token: TokenType.Catch; value: undefined };

  export type Event = { token: TokenType.Event; value: undefined };
  export type Emit = { token: TokenType.Emit; value: undefined };
  export type Indexed = { token: TokenType.Indexed; value: undefined };
  export type Anonymous = { token: TokenType.Anonymous; value: undefined };

  export type New = { token: TokenType.New; value: undefined };
  export type Delete = { token: TokenType.Delete; value: undefined };

  // type keywords

  export type Struct = { token: TokenType.Struct; value: undefined };
  export type Enum = { token: TokenType.Enum; value: undefined };
  export type Type = { token: TokenType.Type; value: undefined };
  export type Mapping = { token: TokenType.Mapping; value: undefined };

  export type Address = { token: TokenType.Address; value: undefined };
  export type String = { token: TokenType.String; value: undefined };
  export type Uint = { token: TokenType.Uint; value: undefined; size: number };
  export type Int = { token: TokenType.Int; value: undefined; size: number };
  export type Byte = { token: TokenType.Byte; value: undefined; size: number };
  export type Bytes = { token: TokenType.Bytes; value: undefined };
  export type Bool = { token: TokenType.Bool; value: undefined };

  // symbols

  export type Member = { token: TokenType.Member; value: undefined };
  export type Comma = { token: TokenType.Comma; value: undefined };
  export type Question = { token: TokenType.Question; value: undefined };
  export type OpenParenthesis = { token: TokenType.OpenParenthesis; value: undefined };
  export type CloseParenthesis = { token: TokenType.CloseParenthesis; value: undefined };
  export type OpenCurlyBrace = { token: TokenType.OpenCurlyBrace; value: undefined };
  export type CloseCurlyBrace = { token: TokenType.CloseCurlyBrace; value: undefined };
  export type OpenBracket = { token: TokenType.OpenBracket; value: undefined };
  export type CloseBracket = { token: TokenType.CloseBracket; value: undefined };
  export type Semicolon = { token: TokenType.Semicolon; value: undefined };
  export type Colon = { token: TokenType.Colon; value: undefined };
  export type Arrow = { token: TokenType.Arrow; value: undefined };
  export type Placeholder = { token: TokenType.Placeholder; value: undefined };

  // operators

  export type Assign = { token: TokenType.Assign; value: undefined };
  export type Add = { token: TokenType.Add; value: undefined };
  export type AddAssign = { token: TokenType.AddAssign; value: undefined };
  export type Increment = { token: TokenType.Increment; value: undefined };
  export type Subtract = { token: TokenType.Subtract; value: undefined };
  export type SubtractAssign = { token: TokenType.SubtractAssign; value: undefined };
  export type Decrement = { token: TokenType.Decrement; value: undefined };
  export type Mul = { token: TokenType.Mul; value: undefined };
  export type MulAssign = { token: TokenType.MulAssign; value: undefined };
  export type Divide = { token: TokenType.Divide; value: undefined };
  export type DivideAssign = { token: TokenType.DivideAssign; value: undefined };
  export type Modulo = { token: TokenType.Modulo; value: undefined };
  export type ModuloAssign = { token: TokenType.ModuloAssign; value: undefined };
  export type Power = { token: TokenType.Power; value: undefined };
  export type And = { token: TokenType.And; value: undefined };
  export type Or = { token: TokenType.Or; value: undefined };

  // bitwise operators

  export type BitwiseOr = { token: TokenType.BitwiseOr; value: undefined };
  export type BitwiseOrAssign = { token: TokenType.BitwiseOrAssign; value: undefined };
  export type BitwiseXOr = { token: TokenType.BitwiseXOr; value: undefined };
  export type BitwiseXOrAssign = { token: TokenType.BitwiseXOrAssign; value: undefined };
  export type BitwiseAnd = { token: TokenType.BitwiseAnd; value: undefined };
  export type BitwiseAndAssign = { token: TokenType.BitwiseAndAssign; value: undefined };
  export type ShiftRight = { token: TokenType.ShiftRight; value: undefined };
  export type ShiftRightAssign = { token: TokenType.ShiftRightAssign; value: undefined };
  export type ShiftLeft = { token: TokenType.ShiftLeft; value: undefined };
  export type ShiftLeftAssign = { token: TokenType.ShiftLeftAssign; value: undefined };

  // comparisons

  export type Equal = { token: TokenType.Equal; value: undefined };
  export type Not = { token: TokenType.Not; value: undefined };
  export type NotEqual = { token: TokenType.NotEqual; value: undefined };
  export type Less = { token: TokenType.Less; value: undefined };
  export type LessEqual = { token: TokenType.LessEqual; value: undefined };
  export type More = { token: TokenType.More; value: undefined };
  export type MoreEqual = { token: TokenType.MoreEqual; value: undefined };

  // yul

  export type Assembly = { token: TokenType.Assembly; value: undefined };
  export type ColonAssign = { token: TokenType.ColonAssign; value: undefined };
  export type YulArrow = { token: TokenType.YulArrow; value: undefined };
  export type Let = { token: TokenType.Let; value: undefined };
  export type Leave = { token: TokenType.Leave; value: undefined };

  // reserved keywords

  export type After = { token: TokenType.After; value: undefined };
  export type Alias = { token: TokenType.Alias; value: undefined };
  export type Apply = { token: TokenType.Apply; value: undefined };
  export type Auto = { token: TokenType.Auto; value: undefined };
  export type Byte_ = { token: TokenType.Byte_; value: undefined };
  export type Copyof = { token: TokenType.Copyof; value: undefined };
  export type Define = { token: TokenType.Define; value: undefined };
  export type Final = { token: TokenType.Final; value: undefined };
  export type Implements = { token: TokenType.Implements; value: undefined };
  export type In = { token: TokenType.In; value: undefined };
  export type Inline = { token: TokenType.Inline; value: undefined };
  export type Macro = { token: TokenType.Macro; value: undefined };
  export type Match = { token: TokenType.Match; value: undefined };
  export type Mutable = { token: TokenType.Mutable; value: undefined };
  export type Null = { token: TokenType.Null; value: undefined };
  export type Of = { token: TokenType.Of; value: undefined };
  export type Partial = { token: TokenType.Partial; value: undefined };
  export type Promise = { token: TokenType.Promise; value: undefined };
  export type Reference = { token: TokenType.Reference; value: undefined };
  export type Relocatable = { token: TokenType.Relocatable; value: undefined };
  export type Sealed = { token: TokenType.Sealed; value: undefined };
  export type Sizeof = { token: TokenType.Sizeof; value: undefined };
  export type Static = { token: TokenType.Static; value: undefined };
  export type Supports = { token: TokenType.Supports; value: undefined };
  export type Typedef = { token: TokenType.Typedef; value: undefined };
  export type Typeof = { token: TokenType.Typeof; value: undefined };
  export type Var = { token: TokenType.Var; value: undefined };

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
    | Leave
    | After
    | Alias
    | Apply
    | Auto
    | Byte_
    | Copyof
    | Define
    | Final
    | Implements
    | In
    | Inline
    | Macro
    | Match
    | Mutable
    | Null
    | Of
    | Partial
    | Promise
    | Reference
    | Relocatable
    | Sealed
    | Sizeof
    | Static
    | Supports
    | Typedef
    | Typeof
    | Var;
}
