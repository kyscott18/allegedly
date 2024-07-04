import { UnrecognizedSymbolError } from "./errors/unrecognizedSymbol";
import { Token } from "./types/token";
import { createCursor } from "./utils/cursor";

const isEmpty = (char: string) => char === " " || char === "\t" || char === "\n" || char === "";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isChar = (char: string) =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";

const symbolSet = new Set([
  ".",
  ",",
  "?",
  "(",
  ")",
  "{",
  "}",
  "[",
  "]",
  ":",
  ";",
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "&",
  "^",
  "|",
  ">",
  "<",
  "!",
  "-",
]);

export const tokenize = (source: string): Token.Token[] => {
  const cursor = createCursor(source);
  const tokens: Token.Token[] = [];

  for (const char of cursor) {
    if (isEmpty(char)) continue;

    // symbols
    if (symbolSet.has(char)) {
      if (char === ".") {
        tokens.push({ token: Token.TokenType.Member, value: undefined });
      } else if (char === ",") {
        tokens.push({ token: Token.TokenType.Comma, value: undefined });
      } else if (char === "?") {
        tokens.push({ token: Token.TokenType.Question, value: undefined });
      } else if (char === "(") {
        tokens.push({ token: Token.TokenType.OpenParenthesis, value: undefined });
      } else if (char === ")") {
        tokens.push({ token: Token.TokenType.CloseParenthesis, value: undefined });
      } else if (char === "{") {
        tokens.push({ token: Token.TokenType.OpenCurlyBrace, value: undefined });
      } else if (char === "}") {
        tokens.push({ token: Token.TokenType.CloseCurlyBrace, value: undefined });
      } else if (char === "[") {
        tokens.push({ token: Token.TokenType.OpenBracket, value: undefined });
      } else if (char === "]") {
        tokens.push({ token: Token.TokenType.CloseBracket, value: undefined });
      } else if (char === ":") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.ColonAssign, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Colon, value: undefined });
        }
      } else if (char === ";") {
        tokens.push({ token: Token.TokenType.Semicolon, value: undefined });
      } else if (char === "=") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Equal, value: undefined });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Arrow, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Assign, value: undefined });
        }
      } else if (char === "+") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.AddAssign, value: undefined });
        } else if (cursor.peek() === "+") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Increment, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Add, value: undefined });
        }
      } else if (char === "-") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.SubtractAssign, value: undefined });
        } else if (cursor.peek() === "-") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Decrement, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Subtract, value: undefined });
        }
      } else if (char === "*") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.MulAssign, value: undefined });
        } else if (cursor.peek() === "*") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Power, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Mul, value: undefined });
        }
      } else if (char === "/") {
        if (cursor.peek() === "/") {
          for (const char of cursor) {
            if (char === "\n") break;
          }
        } else if (cursor.peek() === "*") {
          for (const char of cursor) {
            if (char === "*" && cursor.peek() === "/") {
              cursor.position++;
              break;
            }
          }
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.DivideAssign, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Divide, value: undefined });
        }
      } else if (char === "%") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.ModuloAssign, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Modulo, value: undefined });
        }
      } else if (char === "&") {
        if (cursor.peek() === "&") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.And, value: undefined });
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.BitwiseAndAssign, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.BitwiseAnd, value: undefined });
        }
      } else if (char === "|") {
        if (cursor.peek() === "|") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Or, value: undefined });
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.BitwiseOrAssign, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.BitwiseOr, value: undefined });
        }
      } else if (char === "^") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.BitwiseXOrAssign, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.BitwiseXOr, value: undefined });
        }
      } else if (char === ">") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.MoreEqual, value: undefined });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          if (cursor.peek() === "=") {
            cursor.position++;
            tokens.push({ token: Token.TokenType.ShiftRightAssign, value: undefined });
          } else {
            tokens.push({ token: Token.TokenType.ShiftRight, value: undefined });
          }
        } else {
          tokens.push({ token: Token.TokenType.More, value: undefined });
        }
      } else if (char === "<") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.LessEqual, value: undefined });
        } else if (cursor.peek() === "<") {
          cursor.position++;
          if (cursor.peek() === "=") {
            cursor.position++;
            tokens.push({ token: Token.TokenType.ShiftLeftAssign, value: undefined });
          } else {
            tokens.push({ token: Token.TokenType.ShiftLeft, value: undefined });
          }
        } else {
          tokens.push({ token: Token.TokenType.Less, value: undefined });
        }
      } else if (char === "!") {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.NotEqual, value: undefined });
        } else {
          tokens.push({ token: Token.TokenType.Not, value: undefined });
        }
      } else if (char === "-") {
        if (cursor.peek() === ">") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.YulArrow, value: undefined });
        } else {
          throw new UnrecognizedSymbolError({ symbol: char });
        }
      }
    } else if (char === "\\") {
    } else if (char === '"') {
      // TODO(kyle) string literal
    } else if (isDigit(char)) {
      // TODO(kyle) bytes literals
      let length = 1;
      for (const char of cursor) {
        if (isDigit(char)) length++;
        else {
          cursor.position--;
          break;
        }
      }

      tokens.push({
        token: Token.TokenType.NumberLiteral,
        value: source.substring(cursor.position - length, cursor.position),
      });
    } else if (isChar(char)) {
      let length = 1;
      for (const char of cursor) {
        if (isChar(char) || isDigit(char)) length++;
        else {
          cursor.position--;
          break;
        }
      }

      tokens.push(matchWord(source.substring(cursor.position - length, cursor.position)));
    } else {
      throw new UnrecognizedSymbolError({ symbol: char });
    }
  }

  return tokens;
};

const keywordSet = new Set([
  "if",
  "else",
  "while",
  "do",
  "for",
  "break",
  "continue",
  "switch",
  "case",
  "default",
  "return",
  "calldata",
  "memory",
  "storage",
  "immutable",
  "constant",
  "contract",
  "abstract",
  "interface",
  "library",
  "pragma",
  "import",
  "from",
  "using",
  "as",
  "is",
  "function",
  "external",
  "public",
  "internal",
  "private",
  "view",
  "pure",
  "returns",
  "payable",
  "nonpayable",
  "virtual",
  "override",
  "constructor",
  "modifier",
  "receive",
  "fallback",
  "unchecked",
  "revert",
  "assert",
  "throw",
  "try",
  "catch",
  "event",
  "emit",
  "indexed",
  "anonymous",
  "new",
  "delete",
  "struct",
  "enum",
  "type",
  "mapping",
  "address",
  "string",
  "bytes",
  "bool",
  "assembly",
  "let",
  "leave",
  "after",
  "alias",
  "apply",
  "auto",
  "byte",
  "copyof",
  "define",
  "final",
  "implements",
  "in",
  "inline",
  "macro",
  "match",
  "mutable",
  "null",
  "of",
  "partial",
  "promise",
  "reference",
  "relocatable",
  "sealed",
  "sizeof",
  "static",
  "supports",
  "typedef",
  "typeof",
  "var",
]);

const sizedTypesSet = new Set([
  "int8",
  "int16",
  "int24",
  "int32",
  "int40",
  "int48",
  "int56",
  "int64",
  "int72",
  "int80",
  "int88",
  "int96",
  "int104",
  "int112",
  "int120",
  "int128",
  "int136",
  "int144",
  "int152",
  "int160",
  "int168",
  "int176",
  "int184",
  "int192",
  "int200",
  "int208",
  "int216",
  "int224",
  "int232",
  "int240",
  "int248",
  "int256",
  "uint8",
  "uint16",
  "uint24",
  "uint32",
  "uint40",
  "uint48",
  "uint56",
  "uint64",
  "uint72",
  "uint80",
  "uint88",
  "uint96",
  "uint104",
  "uint112",
  "uint120",
  "uint128",
  "uint136",
  "uint144",
  "uint152",
  "uint160",
  "uint168",
  "uint176",
  "uint184",
  "uint192",
  "uint200",
  "uint208",
  "uint216",
  "uint224",
  "uint232",
  "uint240",
  "uint248",
  "uint256",
  "bytes1",
  "bytes2",
  "bytes3",
  "bytes4",
  "bytes5",
  "bytes6",
  "bytes7",
  "bytes8",
  "bytes9",
  "bytes10",
  "bytes11",
  "bytes12",
  "bytes13",
  "bytes14",
  "bytes15",
  "bytes16",
  "bytes17",
  "bytes18",
  "bytes19",
  "bytes20",
  "bytes21",
  "bytes22",
  "bytes23",
  "bytes24",
  "bytes25",
  "bytes26",
  "bytes27",
  "bytes28",
  "bytes29",
  "bytes30",
  "bytes31",
  "bytes32",
]);

const matchWord = (word: string): Token.Token => {
  if (word.length === 1) return { token: Token.TokenType.Identifier, value: word };

  // TODO(kyle) uppercase keywords?

  if (sizedTypesSet.has(word)) {
    if (word.startsWith("uint")) {
      const size = Number(word.substring(4));
      return { token: Token.TokenType.Uint, value: undefined, size };
    }

    if (word.startsWith("int")) {
      const size = Number(word.substring(3));
      return { token: Token.TokenType.Int, value: undefined, size };
    }

    // bytes
    const size = Number(word.substring(5));
    return { token: Token.TokenType.Bytes, value: undefined, size };
  }

  if (keywordSet.has(word)) {
    if (word === "if") return { token: Token.TokenType.If, value: undefined };
    if (word === "else") return { token: Token.TokenType.Else, value: undefined };
    if (word === "while") return { token: Token.TokenType.While, value: undefined };
    if (word === "do") return { token: Token.TokenType.Do, value: undefined };
    if (word === "for") return { token: Token.TokenType.For, value: undefined };
    if (word === "break") return { token: Token.TokenType.Break, value: undefined };
    if (word === "continue") return { token: Token.TokenType.Continue, value: undefined };
    if (word === "switch") return { token: Token.TokenType.Switch, value: undefined };
    if (word === "case") return { token: Token.TokenType.Case, value: undefined };
    if (word === "default") return { token: Token.TokenType.Default, value: undefined };
    if (word === "return") return { token: Token.TokenType.Return, value: undefined };
    if (word === "calldata") return { token: Token.TokenType.Calldata, value: undefined };
    if (word === "memory") return { token: Token.TokenType.Memory, value: undefined };
    if (word === "storage") return { token: Token.TokenType.Storage, value: undefined };
    if (word === "immutable") return { token: Token.TokenType.Immutable, value: undefined };
    if (word === "constant") return { token: Token.TokenType.Constant, value: undefined };
    if (word === "contract") return { token: Token.TokenType.Contract, value: undefined };
    if (word === "abstract") return { token: Token.TokenType.Abstract, value: undefined };
    if (word === "interface") return { token: Token.TokenType.Interface, value: undefined };
    if (word === "library") return { token: Token.TokenType.Library, value: undefined };
    if (word === "pragma") return { token: Token.TokenType.Pragma, value: undefined };
    if (word === "import") return { token: Token.TokenType.Import, value: undefined };
    if (word === "from") return { token: Token.TokenType.From, value: undefined };
    if (word === "using") return { token: Token.TokenType.Using, value: undefined };
    if (word === "as") return { token: Token.TokenType.As, value: undefined };
    if (word === "is") return { token: Token.TokenType.Is, value: undefined };
    if (word === "function") return { token: Token.TokenType.Function, value: undefined };
    if (word === "external") return { token: Token.TokenType.External, value: undefined };
    if (word === "public") return { token: Token.TokenType.Public, value: undefined };
    if (word === "internal") return { token: Token.TokenType.Internal, value: undefined };
    if (word === "private") return { token: Token.TokenType.Private, value: undefined };
    if (word === "view") return { token: Token.TokenType.View, value: undefined };
    if (word === "pure") return { token: Token.TokenType.Pure, value: undefined };
    if (word === "returns") return { token: Token.TokenType.Returns, value: undefined };
    if (word === "payable") return { token: Token.TokenType.Payable, value: undefined };
    if (word === "nonpayable") return { token: Token.TokenType.Nonpayable, value: undefined };
    if (word === "virtual") return { token: Token.TokenType.Virtual, value: undefined };
    if (word === "override") return { token: Token.TokenType.Override, value: undefined };
    if (word === "constructor") return { token: Token.TokenType.Constructor, value: undefined };
    if (word === "modifier") return { token: Token.TokenType.Modifier, value: undefined };
    if (word === "receive") return { token: Token.TokenType.Receive, value: undefined };
    if (word === "fallback") return { token: Token.TokenType.Fallback, value: undefined };
    if (word === "unchecked") return { token: Token.TokenType.Unchecked, value: undefined };
    if (word === "revert") return { token: Token.TokenType.Revert, value: undefined };
    if (word === "assert") return { token: Token.TokenType.Assert, value: undefined };
    if (word === "throw") return { token: Token.TokenType.Throw, value: undefined };
    if (word === "try") return { token: Token.TokenType.Try, value: undefined };
    if (word === "catch") return { token: Token.TokenType.Catch, value: undefined };
    if (word === "event") return { token: Token.TokenType.Event, value: undefined };
    if (word === "emit") return { token: Token.TokenType.Emit, value: undefined };
    if (word === "indexed") return { token: Token.TokenType.Indexed, value: undefined };
    if (word === "anonymous") return { token: Token.TokenType.Anonymous, value: undefined };
    if (word === "new") return { token: Token.TokenType.New, value: undefined };
    if (word === "delete") return { token: Token.TokenType.Delete, value: undefined };
    if (word === "struct") return { token: Token.TokenType.Struct, value: undefined };
    if (word === "enum") return { token: Token.TokenType.Enum, value: undefined };
    if (word === "type") return { token: Token.TokenType.Type, value: undefined };
    if (word === "mapping") return { token: Token.TokenType.Mapping, value: undefined };
    if (word === "address") return { token: Token.TokenType.Address, value: undefined };
    if (word === "string") return { token: Token.TokenType.String, value: undefined };
    if (word === "bytes") return { token: Token.TokenType.Bytes, value: undefined };
    if (word === "bool") return { token: Token.TokenType.Bool, value: undefined };
    if (word === "assembly") return { token: Token.TokenType.Assembly, value: undefined };
    if (word === "let") return { token: Token.TokenType.Let, value: undefined };
    if (word === "leave") return { token: Token.TokenType.Leave, value: undefined };
    if (word === "after") return { token: Token.TokenType.After, value: undefined };
    if (word === "alias") return { token: Token.TokenType.Alias, value: undefined };
    if (word === "apply") return { token: Token.TokenType.Apply, value: undefined };
    if (word === "auto") return { token: Token.TokenType.Auto, value: undefined };
    if (word === "byte") return { token: Token.TokenType.Byte_, value: undefined };
    if (word === "copyof") return { token: Token.TokenType.Copyof, value: undefined };
    if (word === "define") return { token: Token.TokenType.Define, value: undefined };
    if (word === "final") return { token: Token.TokenType.Final, value: undefined };
    if (word === "implements") return { token: Token.TokenType.Implements, value: undefined };
    if (word === "in") return { token: Token.TokenType.In, value: undefined };
    if (word === "inline") return { token: Token.TokenType.Inline, value: undefined };
    if (word === "macro") return { token: Token.TokenType.Macro, value: undefined };
    if (word === "match") return { token: Token.TokenType.Match, value: undefined };
    if (word === "mutable") return { token: Token.TokenType.Mutable, value: undefined };
    if (word === "null") return { token: Token.TokenType.Null, value: undefined };
    if (word === "of") return { token: Token.TokenType.Of, value: undefined };
    if (word === "partial") return { token: Token.TokenType.Partial, value: undefined };
    if (word === "promise") return { token: Token.TokenType.Promise, value: undefined };
    if (word === "reference") return { token: Token.TokenType.Reference, value: undefined };
    if (word === "relocatable") return { token: Token.TokenType.Relocatable, value: undefined };
    if (word === "sealed") return { token: Token.TokenType.Sealed, value: undefined };
    if (word === "sizeof") return { token: Token.TokenType.Sizeof, value: undefined };
    if (word === "static") return { token: Token.TokenType.Static, value: undefined };
    if (word === "supports") return { token: Token.TokenType.Supports, value: undefined };
    if (word === "typedef") return { token: Token.TokenType.Typedef, value: undefined };
    if (word === "typeof") return { token: Token.TokenType.Typeof, value: undefined };
    if (word === "var") return { token: Token.TokenType.Var, value: undefined };
  }

  return { token: Token.TokenType.Identifier, value: word };
};
