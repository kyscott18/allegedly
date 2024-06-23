export namespace Token {
  export type Identifier = { type: "identifier"; lexeme: string };

  // literals

  export type StringLiteral = {
    type: "stringLiteral";
    unicode: boolean;
    value: string;
  };
  export type AddressLiteral = { type: "addressLiteral"; value: `0x${string}` };
  export type HexLiteral = { type: "hexLiteral"; value: `0x${string}` };
  export type NumberLiteral = { type: "mumberLiteral"; value: string; exponent: string };
  export type RationalNumberLiteral = {
    type: "rationalNumberLiteral";
    value: string;
    fraction: string;
    exponent: string;
  };
  export type HexNumberLiteral = { type: "hexNumberLiteral"; value: `0x${string}` };
  export type BoolLiteral = { type: "boolLiteral"; value: boolean };

  // keywords

  export type If = { type: "if" };
  export type Else = { type: "else" };
  export type While = { type: "while" };
  export type Do = { type: "do" };
  export type For = { type: "for" };
  export type Break = { type: "break" };
  export type Continue = { type: "continue" };
  export type Switch = { type: "switch" };
  export type Case = { type: "case" };
  export type Default = { type: "default" };
  export type Return = { type: "return" };

  export type Calldata = { type: "calldata" };
  export type Memory = { type: "memory" };
  export type Storage = { type: "storage" };
  export type Immutable = { type: "immutable" };
  export type Constant = { type: "constant" };

  export type Contract = { type: "contract" };
  export type Abstract = { type: "abstract" };
  export type Interface = { type: "interface" };
  export type Library = { type: "library" };

  export type Pragma = { type: "pragma" };
  export type Import = { type: "import" };
  export type From = { type: "from" };
  export type Using = { type: "using" };

  export type Function = { type: "function" };
  export type External = { type: "external" };
  export type Public = { type: "public" };
  export type Internal = { type: "internal" };
  export type Private = { type: "private" };
  export type View = { type: "view" };
  export type Pure = { type: "pure" };
  export type Returns = { type: "returns" };
  export type Payable = { type: "payable" };
  export type Nonpayable = { type: "nonpayable" };
  export type Receive = { type: "receive" };
  export type Fallback = { type: "fallback" };
  export type Virtual = { type: "virtual" };
  export type Override = { type: "override" };

  export type Revert = { type: "revert" };
  export type Assert = { type: "assert" };
  export type Throw = { type: "throw" };

  export type Try = { type: "try" };
  export type Catch = { type: "catch" };

  export type Event = { type: "event" };
  export type Emit = { type: "emit" };
  export type Indexed = { type: "indexed" };
  export type Anonymous = { type: "anonymous" };

  export type New = { type: "new" };
  export type Delete = { type: "delete" };

  // type keywords

  export type Struct = { type: "struct" };
  export type Enum = { type: "enum" };
  export type Type = { type: "type" };
  export type Mapping = { type: "mapping" };

  export type Address = { type: "address" };
  export type String = { type: "string" };
  export type Uint = { type: "uint"; size: number };
  export type Int = { type: "int"; size: number };
  export type Bytes = { type: "bytes"; size: number };
  export type Bool = { type: "bool" };

  // symbols

  export type Member = { type: "member" };
  export type Comma = { type: "commma" };
  export type Question = { type: "question" };
  export type OpenParenthesis = { type: "openParenthesis" };
  export type CloseParenthesis = { type: "closeParenthesis" };
  export type OpenCurlyBrace = { type: "openCurlyBrace" };
  export type CloseCurlyBrace = { type: "closeCurlyBrace" };
  export type OpenBracket = { type: "openBracket" };
  export type CloseBracket = { type: "closeBracket" };
  export type Semicolon = { type: "semicolon" };
  export type Colon = { type: "colon" };

  // operators

  export type Assign = { type: "assign" };
  export type ColonAssign = { type: "colonAssign" };
  export type Add = { type: "add" };
  export type AddAssign = { type: "addAssign" };
  export type Increment = { type: "increment" };
  export type Subtract = { type: "subtract" };
  export type SubtractAssign = { type: "subtractAssign" };
  export type Decrement = { type: "decrement" };
  export type Mul = { type: "mul" };
  export type MulAssign = { type: "mulAssign" };
  export type Divide = { type: "divide" };
  export type DivideAssign = { type: "divideAssign" };
  export type Modulo = { type: "modulo" };
  export type ModuloAssign = { type: "moduloAssign" };
  export type Power = { type: "power" };
  export type And = { type: "and" };
  export type Or = { type: "or" };

  // TODO(kyle) bitwise operators

  // comparisons

  export type Equal = { type: "equal" };
  export type Not = { type: "not" };
  export type NotEqual = { type: "notEqual" };
  export type Less = { type: "less" };
  export type LessEqual = { type: "lessEqual" };
  export type More = { type: "more" };
  export type MoreEqual = { type: "moreEqual" };

  // TODO(kyle) yul

  // TODO(kyle) Reserved keywords

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
    | Receive
    | Fallback
    | Virtual
    | Override
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
    | Assign
    | ColonAssign
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
    | Equal
    | Not
    | NotEqual
    | Less
    | LessEqual
    | More
    | MoreEqual;
}
