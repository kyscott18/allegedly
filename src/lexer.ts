import type { Hex } from "viem";
import { NotImplementedError } from "./errors/notImplemented";
import { ReservedKeywordError } from "./errors/reservedKeyword";
import { UnrecognizedSymbolError } from "./errors/unrecognizedSymbol";
import { Token } from "./types/token";
import type { SourceLocation } from "./types/utils";
import { createCursor } from "./utils/cursor";

const isEmpty = (char: string) =>
  char === " " || char === "\t" || char === "\n" || char === "\r" || char === "";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isIndentifierStart = (char: string) =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";
const isIdentifier = (char: string) => isIndentifierStart(char) || isDigit(char);
const isHex = (char: string) =>
  (char >= "a" && char <= "f") || (char >= "A" && char <= "F") || (char >= "0" && char <= "9");

const toLoc = (start: SourceLocation["start"], length: number): SourceLocation => {
  return {
    start,
    end: {
      line: start.line,
      offset: start.offset + length,
    },
  };
};

export const tokenize = (source: string): Token.Token[] => {
  const cursor = createCursor(source);
  const tokens: Token.Token[] = [];

  const symbolMap = new Map<string, (start: SourceLocation["start"]) => void>([
    [".", (start) => tokens.push({ token: Token.disc.Member, loc: toLoc(start, 1) })],
    [",", (start) => tokens.push({ token: Token.disc.Comma, loc: toLoc(start, 1) })],
    ["?", (start) => tokens.push({ token: Token.disc.Question, loc: toLoc(start, 1) })],
    ["(", (start) => tokens.push({ token: Token.disc.OpenParenthesis, loc: toLoc(start, 1) })],
    [")", (start) => tokens.push({ token: Token.disc.CloseParenthesis, loc: toLoc(start, 1) })],
    ["{", (start) => tokens.push({ token: Token.disc.OpenCurlyBrace, loc: toLoc(start, 1) })],
    ["}", (start) => tokens.push({ token: Token.disc.CloseCurlyBrace, loc: toLoc(start, 1) })],
    ["[", (start) => tokens.push({ token: Token.disc.OpenBracket, loc: toLoc(start, 1) })],
    ["]", (start) => tokens.push({ token: Token.disc.CloseBracket, loc: toLoc(start, 1) })],
    [";", (start) => tokens.push({ token: Token.disc.Semicolon, loc: toLoc(start, 1) })],
    ["~", (start) => tokens.push({ token: Token.disc.BitwiseNot, loc: toLoc(start, 1) })],
    [
      ":",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.ColonAssign, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Colon, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "=",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.Equal, loc: toLoc(start, 2) });
        } else if (cursor.peek() === ">") {
          cursor.next();
          tokens.push({ token: Token.disc.Arrow, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Assign, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "+",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.AddAssign, loc: toLoc(start, 2) });
        } else if (cursor.peek() === "+") {
          cursor.next();
          tokens.push({ token: Token.disc.Increment, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Add, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "-",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.SubtractAssign, loc: toLoc(start, 2) });
        } else if (cursor.peek() === "-") {
          cursor.next();
          tokens.push({ token: Token.disc.Decrement, loc: toLoc(start, 2) });
        } else if (cursor.peek() === ">") {
          cursor.next();
          tokens.push({ token: Token.disc.YulArrow, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Subtract, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "*",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.MulAssign, loc: toLoc(start, 2) });
        } else if (cursor.peek() === "*") {
          cursor.next();
          tokens.push({ token: Token.disc.Power, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Mul, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "/",
      (start) => {
        if (cursor.peek() === "/") {
          for (const char of cursor) {
            if (char === "\n") break;
          }
        } else if (cursor.peek() === "*") {
          for (const char of cursor) {
            if (char === "*" && cursor.peek() === "/") {
              cursor.next();
              break;
            }
          }
        } else if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.DivideAssign, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Divide, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "%",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.ModuloAssign, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Modulo, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "&",
      (start) => {
        if (cursor.peek() === "&") {
          cursor.next();
          tokens.push({ token: Token.disc.And, loc: toLoc(start, 2) });
        } else if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.BitwiseAndAssign, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.BitwiseAnd, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "|",
      (start) => {
        if (cursor.peek() === "|") {
          cursor.next();
          tokens.push({ token: Token.disc.Or, loc: toLoc(start, 2) });
        } else if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.BitwiseOrAssign, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.BitwiseOr, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "^",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.BitwiseXOrAssign, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.BitwiseXOr, loc: toLoc(start, 1) });
        }
      },
    ],

    [
      ">",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.MoreEqual, loc: toLoc(start, 2) });
        } else if (cursor.peek() === ">") {
          cursor.next();
          if (cursor.peek() === "=") {
            cursor.next();
            tokens.push({ token: Token.disc.ShiftRightAssign, loc: toLoc(start, 3) });
          } else {
            tokens.push({ token: Token.disc.ShiftRight, loc: toLoc(start, 2) });
          }
        } else {
          tokens.push({ token: Token.disc.More, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "<",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.LessEqual, loc: toLoc(start, 2) });
        } else if (cursor.peek() === "<") {
          cursor.next();
          if (cursor.peek() === "=") {
            cursor.next();
            tokens.push({ token: Token.disc.ShiftLeftAssign, loc: toLoc(start, 3) });
          } else {
            tokens.push({ token: Token.disc.ShiftLeft, loc: toLoc(start, 2) });
          }
        } else {
          tokens.push({ token: Token.disc.Less, loc: toLoc(start, 1) });
        }
      },
    ],
    [
      "!",
      (start) => {
        if (cursor.peek() === "=") {
          cursor.next();
          tokens.push({ token: Token.disc.NotEqual, loc: toLoc(start, 2) });
        } else {
          tokens.push({ token: Token.disc.Not, loc: toLoc(start, 1) });
        }
      },
    ],
  ]);

  const keywordMap = new Map<string, (loc: SourceLocation) => void>([
    ["true", (loc) => tokens.push({ token: Token.disc.BoolLiteral, loc, value: true })],
    ["false", (loc) => tokens.push({ token: Token.disc.BoolLiteral, loc, value: false })],
    ["if", (loc) => tokens.push({ token: Token.disc.If, loc })],
    ["else", (loc) => tokens.push({ token: Token.disc.Else, loc })],
    ["while", (loc) => tokens.push({ token: Token.disc.While, loc })],
    ["do", (loc) => tokens.push({ token: Token.disc.Do, loc })],
    ["for", (loc) => tokens.push({ token: Token.disc.For, loc })],
    ["break", (loc) => tokens.push({ token: Token.disc.Break, loc })],
    ["continue", (loc) => tokens.push({ token: Token.disc.Continue, loc })],
    ["switch", (loc) => tokens.push({ token: Token.disc.Switch, loc })],
    ["case", (loc) => tokens.push({ token: Token.disc.Case, loc })],
    ["default", (loc) => tokens.push({ token: Token.disc.Default, loc })],
    ["return", (loc) => tokens.push({ token: Token.disc.Return, loc })],
    ["calldata", (loc) => tokens.push({ token: Token.disc.Calldata, loc })],
    ["memory", (loc) => tokens.push({ token: Token.disc.Memory, loc })],
    ["storage", (loc) => tokens.push({ token: Token.disc.Storage, loc })],
    ["immutable", (loc) => tokens.push({ token: Token.disc.Immutable, loc })],
    ["constant", (loc) => tokens.push({ token: Token.disc.Constant, loc })],
    ["contract", (loc) => tokens.push({ token: Token.disc.Contract, loc })],
    ["abstract", (loc) => tokens.push({ token: Token.disc.Abstract, loc })],
    ["interface", (loc) => tokens.push({ token: Token.disc.Interface, loc })],
    ["library", (loc) => tokens.push({ token: Token.disc.Library, loc })],
    ["pragma", (loc) => tokens.push({ token: Token.disc.Pragma, loc })],
    ["import", (loc) => tokens.push({ token: Token.disc.Import, loc })],
    ["from", (loc) => tokens.push({ token: Token.disc.From, loc })],
    ["using", (loc) => tokens.push({ token: Token.disc.Using, loc })],
    ["as", (loc) => tokens.push({ token: Token.disc.As, loc })],
    ["is", (loc) => tokens.push({ token: Token.disc.Is, loc })],
    ["function", (loc) => tokens.push({ token: Token.disc.Function, loc })],
    ["external", (loc) => tokens.push({ token: Token.disc.External, loc })],
    ["public", (loc) => tokens.push({ token: Token.disc.Public, loc })],
    ["internal", (loc) => tokens.push({ token: Token.disc.Internal, loc })],
    ["private", (loc) => tokens.push({ token: Token.disc.Private, loc })],
    ["view", (loc) => tokens.push({ token: Token.disc.View, loc })],
    ["pure", (loc) => tokens.push({ token: Token.disc.Pure, loc })],
    ["returns", (loc) => tokens.push({ token: Token.disc.Returns, loc })],
    ["payable", (loc) => tokens.push({ token: Token.disc.Payable, loc })],
    ["nonpayable", (loc) => tokens.push({ token: Token.disc.Nonpayable, loc })],
    ["virtual", (loc) => tokens.push({ token: Token.disc.Virtual, loc })],
    ["override", (loc) => tokens.push({ token: Token.disc.Override, loc })],
    ["constructor", (loc) => tokens.push({ token: Token.disc.Constructor, loc })],
    ["modifier", (loc) => tokens.push({ token: Token.disc.Modifier, loc })],
    ["receive", (loc) => tokens.push({ token: Token.disc.Receive, loc })],
    ["fallback", (loc) => tokens.push({ token: Token.disc.Fallback, loc })],
    ["unchecked", (loc) => tokens.push({ token: Token.disc.Unchecked, loc })],
    ["revert", (loc) => tokens.push({ token: Token.disc.Revert, loc })],
    ["error", (loc) => tokens.push({ token: Token.disc.Error, loc })],
    ["assert", (loc) => tokens.push({ token: Token.disc.Assert, loc })],
    ["throw", (loc) => tokens.push({ token: Token.disc.Throw, loc })],
    ["try", (loc) => tokens.push({ token: Token.disc.Try, loc })],
    ["catch", (loc) => tokens.push({ token: Token.disc.Catch, loc })],
    ["event", (loc) => tokens.push({ token: Token.disc.Event, loc })],
    ["emit", (loc) => tokens.push({ token: Token.disc.Emit, loc })],
    ["indexed", (loc) => tokens.push({ token: Token.disc.Indexed, loc })],
    ["anonymous", (loc) => tokens.push({ token: Token.disc.Anonymous, loc })],
    ["new", (loc) => tokens.push({ token: Token.disc.New, loc })],
    ["delete", (loc) => tokens.push({ token: Token.disc.Delete, loc })],
    ["struct", (loc) => tokens.push({ token: Token.disc.Struct, loc })],
    ["enum", (loc) => tokens.push({ token: Token.disc.Enum, loc })],
    ["type", (loc) => tokens.push({ token: Token.disc.Type, loc })],
    ["mapping", (loc) => tokens.push({ token: Token.disc.Mapping, loc })],
    ["address", (loc) => tokens.push({ token: Token.disc.Address, loc })],
    ["string", (loc) => tokens.push({ token: Token.disc.String, loc })],
    ["bytes", (loc) => tokens.push({ token: Token.disc.Bytes, loc })],
    ["bool", (loc) => tokens.push({ token: Token.disc.Bool, loc })],
    ["assembly", (loc) => tokens.push({ token: Token.disc.Assembly, loc })],
    ["let", (loc) => tokens.push({ token: Token.disc.Let, loc })],
    ["leave", (loc) => tokens.push({ token: Token.disc.Leave, loc })],
    ["int8", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 8 })],
    ["int16", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 16 })],
    ["int24", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 24 })],
    ["int32", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 32 })],
    ["int40", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 40 })],
    ["int48", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 48 })],
    ["int56", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 56 })],
    ["int64", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 64 })],
    ["int72", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 72 })],
    ["int80", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 80 })],
    ["int88", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 88 })],
    ["int96", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 96 })],
    ["int104", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 104 })],
    ["int112", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 112 })],
    ["int120", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 120 })],
    ["int128", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 128 })],
    ["int136", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 136 })],
    ["int144", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 144 })],
    ["int152", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 152 })],
    ["int160", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 160 })],
    ["int168", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 168 })],
    ["int176", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 176 })],
    ["int184", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 184 })],
    ["int192", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 192 })],
    ["int200", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 200 })],
    ["int208", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 208 })],
    ["int216", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 216 })],
    ["int224", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 224 })],
    ["int232", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 232 })],
    ["int240", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 240 })],
    ["int248", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 248 })],
    ["int256", (loc) => tokens.push({ token: Token.disc.Int, loc, size: 256 })],
    ["uint8", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 8 })],
    ["uint16", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 16 })],
    ["uint24", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 24 })],
    ["uint32", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 32 })],
    ["uint40", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 40 })],
    ["uint48", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 48 })],
    ["uint56", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 56 })],
    ["uint64", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 64 })],
    ["uint72", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 72 })],
    ["uint80", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 80 })],
    ["uint88", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 88 })],
    ["uint96", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 96 })],
    ["uint104", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 104 })],
    ["uint112", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 112 })],
    ["uint120", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 120 })],
    ["uint128", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 128 })],
    ["uint136", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 136 })],
    ["uint144", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 144 })],
    ["uint152", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 152 })],
    ["uint160", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 160 })],
    ["uint168", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 168 })],
    ["uint176", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 176 })],
    ["uint184", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 184 })],
    ["uint192", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 192 })],
    ["uint200", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 200 })],
    ["uint208", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 208 })],
    ["uint216", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 216 })],
    ["uint224", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 224 })],
    ["uint232", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 232 })],
    ["uint240", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 240 })],
    ["uint248", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 248 })],
    ["uint256", (loc) => tokens.push({ token: Token.disc.Uint, loc, size: 256 })],
    ["bytes1", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 1 })],
    ["bytes2", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 2 })],
    ["bytes3", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 3 })],
    ["bytes4", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 4 })],
    ["bytes5", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 5 })],
    ["bytes6", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 6 })],
    ["bytes7", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 7 })],
    ["bytes8", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 8 })],
    ["bytes9", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 9 })],
    ["bytes10", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 10 })],
    ["bytes11", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 11 })],
    ["bytes12", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 12 })],
    ["bytes13", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 13 })],
    ["bytes14", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 14 })],
    ["bytes15", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 15 })],
    ["bytes16", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 16 })],
    ["bytes17", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 17 })],
    ["bytes18", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 18 })],
    ["bytes19", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 19 })],
    ["bytes20", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 20 })],
    ["bytes21", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 21 })],
    ["bytes22", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 22 })],
    ["bytes23", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 23 })],
    ["bytes24", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 24 })],
    ["bytes25", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 25 })],
    ["bytes26", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 26 })],
    ["bytes27", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 27 })],
    ["bytes28", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 28 })],
    ["bytes29", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 29 })],
    ["bytes30", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 30 })],
    ["bytes31", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 31 })],
    ["bytes32", (loc) => tokens.push({ token: Token.disc.Byte, loc, size: 32 })],
    [
      "after",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "alias",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "apply",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "auto",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "byte",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "copyof",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "define",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "final",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "implements",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "in",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "inline",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "macro",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "match",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "mutable",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "null",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "of",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "partial",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "promise",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "reference",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "relocatable",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "sealed",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "sizeof",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "static",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "supports",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "typedef",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "typeof",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
    [
      "var",
      (loc) => {
        throw new ReservedKeywordError({ source, loc });
      },
    ],
  ]);

  for (const char of cursor) {
    if (isEmpty(char)) continue;

    const start = { line: cursor.line, offset: cursor.offset - 1 };

    if (symbolMap.has(char)) {
      symbolMap.get(char)!(start);
    } else if (char === '"' || char === "'") {
      throw new NotImplementedError({ source, loc: toLoc(start, 1), feature: "string literal" });
    } else if (isDigit(char)) {
      if (char === "0" && cursor.peek() === "x") {
        cursor.next();

        let length = 2;
        for (const char of cursor) {
          if (isHex(char)) length++;
          else {
            cursor.position--;
            cursor.offset--;
            break;
          }
        }

        if (length === 42) {
          tokens.push({
            token: Token.disc.AddressLiteral,
            loc: toLoc(start, length),
            value: source.substring(cursor.position - length, cursor.position) as Hex,
          });
        } else {
          throw new NotImplementedError({
            source,
            loc: toLoc(start, length),
            feature: "hex number literal",
          });
        }
      } else {
        let length = 1;
        for (const char of cursor) {
          if (isDigit(char)) length++;
          else {
            if (char === "." || (char === "e" && cursor.peek() && isDigit(cursor.peek()!))) {
              throw new NotImplementedError({
                source,
                loc: toLoc(start, length),
                feature: "rational number literal",
              });
            }
            cursor.position--;
            cursor.offset--;
            break;
          }
        }

        tokens.push({
          token: Token.disc.NumberLiteral,
          loc: toLoc(start, length),
          value: BigInt(source.substring(cursor.position - length, cursor.position)),
        });
      }
    } else if (isIndentifierStart(char)) {
      // TODO(kyle) hex literal

      let length = 1;
      for (const char of cursor) {
        if (isIdentifier(char)) length++;
        else {
          cursor.position--;
          cursor.offset--;
          break;
        }
      }

      const lexeme = source.substring(cursor.position - length, cursor.position);

      if (keywordMap.has(lexeme)) {
        keywordMap.get(lexeme)!(toLoc(start, lexeme.length));
      } else {
        if (length === 1 && lexeme === "_") {
          tokens.push({ token: Token.disc.Placeholder, loc: toLoc(start, lexeme.length) });
        } else {
          tokens.push({
            token: Token.disc.Identifier,
            value: lexeme,
            loc: toLoc(start, lexeme.length),
          });
        }
      }
    } else {
      throw new UnrecognizedSymbolError({
        source,
        loc: { start, end: { line: start.line, offset: start.offset + 1 } },
      });
    }
  }

  return tokens;
};
