type BaseToken = {
  type: string;
  /** start offset in source code */
  start: number;
  /** end offset in source code */
  end: number;
};

export namespace Token {
  export type Identifier = BaseToken & { type: "identifier"; lexeme: string };

  // literals

  export type StringLiteral = BaseToken & {
    type: "stringLiteral";
    unicode: boolean;
    value: string;
  };
  export type AddressLiteral = BaseToken & { type: "addressLiteral"; value: `0x${string}` };
  export type HexLiteral = BaseToken & { type: "hexLiteral"; value: `0x${string}` };
  export type NumberLiteral = BaseToken & {
    type: "mumberLiteral";
    value: string;
    exponent: string;
  };
  export type RationalNumberLiteral = BaseToken & {
    type: "rationalNumberLiteral";
    value: string;
    fraction: string;
    exponent: string;
  };
  export type HexNumberLiteral = BaseToken & { type: "hexNumberLiteral"; value: `0x${string}` };
  export type BoolLiteral = BaseToken & { type: "boolLiteral"; value: boolean };

  // keywords

  export type If = BaseToken & { type: "if" };
  export type Else = BaseToken & { type: "else" };
  export type While = BaseToken & { type: "while" };
  export type Do = BaseToken & { type: "do" };
  export type For = BaseToken & { type: "for" };
  export type Break = BaseToken & { type: "break" };
  export type Continue = BaseToken & { type: "continue" };
  export type Switch = BaseToken & { type: "switch" };
  export type Case = BaseToken & { type: "case" };
  export type Default = BaseToken & { type: "default" };
  export type Return = BaseToken & { type: "return" };

  export type Calldata = BaseToken & { type: "calldata" };
  export type Memory = BaseToken & { type: "memory" };
  export type Storage = BaseToken & { type: "storage" };
  export type Immutable = BaseToken & { type: "immutable" };
  export type Constant = BaseToken & { type: "constant" };

  export type Contract = BaseToken & { type: "contract" };
  export type Abstract = BaseToken & { type: "abstract" };
  export type Interface = BaseToken & { type: "interface" };
  export type Library = BaseToken & { type: "library" };

  export type Pragma = BaseToken & { type: "pragma" };
  export type Import = BaseToken & { type: "import" };
  export type From = BaseToken & { type: "from" };
  export type Using = BaseToken & { type: "using" };

  export type Function = BaseToken & { type: "function" };
  export type External = BaseToken & { type: "external" };
  export type Public = BaseToken & { type: "public" };
  export type Internal = BaseToken & { type: "internal" };
  export type Private = BaseToken & { type: "private" };
  export type View = BaseToken & { type: "view" };
  export type Pure = BaseToken & { type: "pure" };
  export type Returns = BaseToken & { type: "returns" };
  export type Payable = BaseToken & { type: "payable" };
  export type Nonpayable = BaseToken & { type: "nonpayable" };
  export type Receive = BaseToken & { type: "receive" };
  export type Fallback = BaseToken & { type: "fallback" };
  export type Virtual = BaseToken & { type: "virtual" };
  export type Override = BaseToken & { type: "override" };

  export type Revert = BaseToken & { type: "revert" };
  export type Assert = BaseToken & { type: "assert" };
  export type Throw = BaseToken & { type: "throw" };

  export type Try = BaseToken & { type: "try" };
  export type Catch = BaseToken & { type: "catch" };

  export type Event = BaseToken & { type: "event" };
  export type Emit = BaseToken & { type: "emit" };
  export type Indexed = BaseToken & { type: "indexed" };
  export type Anonymous = BaseToken & { type: "anonymous" };

  export type New = BaseToken & { type: "new" };
  export type Delete = BaseToken & { type: "delete" };

  // type keywords

  export type Struct = BaseToken & { type: "struct" };
  export type Enum = BaseToken & { type: "enum" };
  export type Type = BaseToken & { type: "type" };
  export type Mapping = BaseToken & { type: "mapping" };

  export type Address = BaseToken & { type: "address" };
  export type String = BaseToken & { type: "string" };
  export type Uint = BaseToken & { type: "uint"; size: number };
  export type Int = BaseToken & { type: "int"; size: number };
  export type Bytes = BaseToken & { type: "bytes"; size: number };
  export type Bool = BaseToken & { type: "bool" };

  // symbols

  export type Member = BaseToken & { type: "member" };
  export type Comma = BaseToken & { type: "commma" };
  export type Question = BaseToken & { type: "question" };
  export type OpenParenthesis = BaseToken & { type: "openParenthesis" };
  export type CloseParenthesis = BaseToken & { type: "closeParenthesis" };
  export type OpenCurlyBrace = BaseToken & { type: "openCurlyBrace" };
  export type CloseCurlyBrace = BaseToken & { type: "closeCurlyBrace" };
  export type OpenBracket = BaseToken & { type: "openBracket" };
  export type CloseBracket = BaseToken & { type: "closeBracket" };
  export type Semicolon = BaseToken & { type: "semicolon" };
  export type Colon = BaseToken & { type: "colon" };

  // operators

  export type Assign = BaseToken & { type: "assign" };
  export type ColonAssign = BaseToken & { type: "colonAssign" };
  export type Add = BaseToken & { type: "add" };
  export type AddAssign = BaseToken & { type: "addAssign" };
  export type Increment = BaseToken & { type: "increment" };
  export type Subtract = BaseToken & { type: "subtract" };
  export type SubtractAssign = BaseToken & { type: "subtractAssign" };
  export type Decrement = BaseToken & { type: "decrement" };
  export type Mul = BaseToken & { type: "mul" };
  export type MulAssign = BaseToken & { type: "mulAssign" };
  export type Divide = BaseToken & { type: "divide" };
  export type DivideAssign = BaseToken & { type: "divideAssign" };
  export type Modulo = BaseToken & { type: "modulo" };
  export type ModuloAssign = BaseToken & { type: "moduloAssign" };
  export type Power = BaseToken & { type: "power" };
  export type And = BaseToken & { type: "and" };
  export type Or = BaseToken & { type: "or" };

  // TODO(kyle) bitwise operators

  // comparisons

  export type Equal = BaseToken & { type: "equal" };
  export type Not = BaseToken & { type: "not" };
  export type NotEqual = BaseToken & { type: "notEqual" };
  export type Less = BaseToken & { type: "less" };
  export type LessEqual = BaseToken & { type: "lessEqual" };
  export type More = BaseToken & { type: "more" };
  export type MoreEqual = BaseToken & { type: "moreEqual" };

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
