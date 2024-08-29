import type { Hex } from "viem";
import { UnrecognizedSymbolError } from "./errors/unrecognizedSymbol";
import { Token } from "./types/token";
import { createCursor } from "./utils/cursor";

const isEmpty = (char: string) => char === " " || char === "\t" || char === "\n" || char === "";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isIndentifierStart = (char: string) =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";
const isIdentifier = (char: string) => isIndentifierStart(char) || isDigit(char);
const isHex = (char: string) =>
  (char >= "a" && char <= "f") || (char >= "A" && char <= "F") || (char >= "0" && char <= "9");

export const tokenize = (source: string): Token.Token[] => {
  const cursor = createCursor(source);
  const tokens: Token.Token[] = [];

  const symbolMap = new Map<string, () => void>([
    [".", () => tokens.push({ token: Token.disc.Member })],
    [",", () => tokens.push({ token: Token.disc.Comma })],
    ["?", () => tokens.push({ token: Token.disc.Question })],
    ["(", () => tokens.push({ token: Token.disc.OpenParenthesis })],
    [")", () => tokens.push({ token: Token.disc.CloseParenthesis })],
    ["{", () => tokens.push({ token: Token.disc.OpenCurlyBrace })],
    ["}", () => tokens.push({ token: Token.disc.CloseCurlyBrace })],
    ["[", () => tokens.push({ token: Token.disc.OpenBracket })],
    ["]", () => tokens.push({ token: Token.disc.CloseBracket })],
    [";", () => tokens.push({ token: Token.disc.Semicolon })],
    ["~", () => tokens.push({ token: Token.disc.BitwiseNot })],
    [
      ":",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.ColonAssign });
        } else {
          tokens.push({ token: Token.disc.Colon });
        }
      },
    ],
    [
      "=",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.Equal });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          tokens.push({ token: Token.disc.Arrow });
        } else {
          tokens.push({ token: Token.disc.Assign });
        }
      },
    ],
    [
      "+",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.AddAssign });
        } else if (cursor.peek() === "+") {
          cursor.position++;
          tokens.push({ token: Token.disc.Increment });
        } else {
          tokens.push({ token: Token.disc.Add });
        }
      },
    ],
    [
      "-",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.SubtractAssign });
        } else if (cursor.peek() === "-") {
          cursor.position++;
          tokens.push({ token: Token.disc.Decrement });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          tokens.push({ token: Token.disc.YulArrow });
        } else {
          tokens.push({ token: Token.disc.Subtract });
        }
      },
    ],
    [
      "*",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.MulAssign });
        } else if (cursor.peek() === "*") {
          cursor.position++;
          tokens.push({ token: Token.disc.Power });
        } else {
          tokens.push({ token: Token.disc.Mul });
        }
      },
    ],
    [
      "/",
      () => {
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
          tokens.push({ token: Token.disc.DivideAssign });
        } else {
          tokens.push({ token: Token.disc.Divide });
        }
      },
    ],
    [
      "%",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.ModuloAssign });
        } else {
          tokens.push({ token: Token.disc.Modulo });
        }
      },
    ],
    [
      "&",
      () => {
        if (cursor.peek() === "&") {
          cursor.position++;
          tokens.push({ token: Token.disc.And });
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.BitwiseAndAssign });
        } else {
          tokens.push({ token: Token.disc.BitwiseAnd });
        }
      },
    ],
    [
      "|",
      () => {
        if (cursor.peek() === "|") {
          cursor.position++;
          tokens.push({ token: Token.disc.Or });
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.BitwiseOrAssign });
        } else {
          tokens.push({ token: Token.disc.BitwiseOr });
        }
      },
    ],
    [
      "^",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.BitwiseXOrAssign });
        } else {
          tokens.push({ token: Token.disc.BitwiseXOr });
        }
      },
    ],

    [
      ">",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.MoreEqual });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          if (cursor.peek() === "=") {
            cursor.position++;
            tokens.push({ token: Token.disc.ShiftRightAssign });
          } else {
            tokens.push({ token: Token.disc.ShiftRight });
          }
        } else {
          tokens.push({ token: Token.disc.More });
        }
      },
    ],
    [
      "<",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.LessEqual });
        } else if (cursor.peek() === "<") {
          cursor.position++;
          if (cursor.peek() === "=") {
            cursor.position++;
            tokens.push({ token: Token.disc.ShiftLeftAssign });
          } else {
            tokens.push({ token: Token.disc.ShiftLeft });
          }
        } else {
          tokens.push({ token: Token.disc.Less });
        }
      },
    ],
    [
      "!",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.disc.NotEqual });
        } else {
          tokens.push({ token: Token.disc.Not });
        }
      },
    ],
  ]);

  const keywordMap = new Map<string, () => void>([
    ["true", () => tokens.push({ token: Token.disc.BoolLiteral, value: true })],
    ["false", () => tokens.push({ token: Token.disc.BoolLiteral, value: false })],
    ["if", () => tokens.push({ token: Token.disc.If })],
    ["else", () => tokens.push({ token: Token.disc.Else })],
    ["while", () => tokens.push({ token: Token.disc.While })],
    ["do", () => tokens.push({ token: Token.disc.Do })],
    ["for", () => tokens.push({ token: Token.disc.For })],
    ["break", () => tokens.push({ token: Token.disc.Break })],
    ["continue", () => tokens.push({ token: Token.disc.Continue })],
    ["switch", () => tokens.push({ token: Token.disc.Switch })],
    ["case", () => tokens.push({ token: Token.disc.Case })],
    ["default", () => tokens.push({ token: Token.disc.Default })],
    ["return", () => tokens.push({ token: Token.disc.Return })],
    ["calldata", () => tokens.push({ token: Token.disc.Calldata })],
    ["memory", () => tokens.push({ token: Token.disc.Memory })],
    ["storage", () => tokens.push({ token: Token.disc.Storage })],
    ["immutable", () => tokens.push({ token: Token.disc.Immutable })],
    ["constant", () => tokens.push({ token: Token.disc.Constant })],
    ["contract", () => tokens.push({ token: Token.disc.Contract })],
    ["abstract", () => tokens.push({ token: Token.disc.Abstract })],
    ["interface", () => tokens.push({ token: Token.disc.Interface })],
    ["library", () => tokens.push({ token: Token.disc.Library })],
    ["pragma", () => tokens.push({ token: Token.disc.Pragma })],
    ["import", () => tokens.push({ token: Token.disc.Import })],
    ["from", () => tokens.push({ token: Token.disc.From })],
    ["using", () => tokens.push({ token: Token.disc.Using })],
    ["as", () => tokens.push({ token: Token.disc.As })],
    ["is", () => tokens.push({ token: Token.disc.Is })],
    ["function", () => tokens.push({ token: Token.disc.Function })],
    ["external", () => tokens.push({ token: Token.disc.External })],
    ["public", () => tokens.push({ token: Token.disc.Public })],
    ["internal", () => tokens.push({ token: Token.disc.Internal })],
    ["private", () => tokens.push({ token: Token.disc.Private })],
    ["view", () => tokens.push({ token: Token.disc.View })],
    ["pure", () => tokens.push({ token: Token.disc.Pure })],
    ["returns", () => tokens.push({ token: Token.disc.Returns })],
    ["payable", () => tokens.push({ token: Token.disc.Payable })],
    ["nonpayable", () => tokens.push({ token: Token.disc.Nonpayable })],
    ["virtual", () => tokens.push({ token: Token.disc.Virtual })],
    ["override", () => tokens.push({ token: Token.disc.Override })],
    ["constructor", () => tokens.push({ token: Token.disc.Constructor })],
    ["modifier", () => tokens.push({ token: Token.disc.Modifier })],
    ["receive", () => tokens.push({ token: Token.disc.Receive })],
    ["fallback", () => tokens.push({ token: Token.disc.Fallback })],
    ["unchecked", () => tokens.push({ token: Token.disc.Unchecked })],
    ["revert", () => tokens.push({ token: Token.disc.Revert })],
    ["error", () => tokens.push({ token: Token.disc.Error })],
    ["assert", () => tokens.push({ token: Token.disc.Assert })],
    ["throw", () => tokens.push({ token: Token.disc.Throw })],
    ["try", () => tokens.push({ token: Token.disc.Try })],
    ["catch", () => tokens.push({ token: Token.disc.Catch })],
    ["event", () => tokens.push({ token: Token.disc.Event })],
    ["emit", () => tokens.push({ token: Token.disc.Emit })],
    ["indexed", () => tokens.push({ token: Token.disc.Indexed })],
    ["anonymous", () => tokens.push({ token: Token.disc.Anonymous })],
    ["new", () => tokens.push({ token: Token.disc.New })],
    ["delete", () => tokens.push({ token: Token.disc.Delete })],
    ["struct", () => tokens.push({ token: Token.disc.Struct })],
    ["enum", () => tokens.push({ token: Token.disc.Enum })],
    ["type", () => tokens.push({ token: Token.disc.Type })],
    ["mapping", () => tokens.push({ token: Token.disc.Mapping })],
    ["address", () => tokens.push({ token: Token.disc.Address })],
    ["string", () => tokens.push({ token: Token.disc.String })],
    ["bytes", () => tokens.push({ token: Token.disc.Bytes })],
    ["bool", () => tokens.push({ token: Token.disc.Bool })],
    ["assembly", () => tokens.push({ token: Token.disc.Assembly })],
    ["let", () => tokens.push({ token: Token.disc.Let })],
    ["leave", () => tokens.push({ token: Token.disc.Leave })],
    ["int8", () => tokens.push({ token: Token.disc.Int, size: 8 })],
    ["int16", () => tokens.push({ token: Token.disc.Int, size: 16 })],
    ["int24", () => tokens.push({ token: Token.disc.Int, size: 24 })],
    ["int32", () => tokens.push({ token: Token.disc.Int, size: 32 })],
    ["int40", () => tokens.push({ token: Token.disc.Int, size: 40 })],
    ["int48", () => tokens.push({ token: Token.disc.Int, size: 48 })],
    ["int56", () => tokens.push({ token: Token.disc.Int, size: 56 })],
    ["int64", () => tokens.push({ token: Token.disc.Int, size: 64 })],
    ["int72", () => tokens.push({ token: Token.disc.Int, size: 72 })],
    ["int80", () => tokens.push({ token: Token.disc.Int, size: 80 })],
    ["int88", () => tokens.push({ token: Token.disc.Int, size: 88 })],
    ["int96", () => tokens.push({ token: Token.disc.Int, size: 96 })],
    ["int104", () => tokens.push({ token: Token.disc.Int, size: 104 })],
    ["int112", () => tokens.push({ token: Token.disc.Int, size: 112 })],
    ["int120", () => tokens.push({ token: Token.disc.Int, size: 120 })],
    ["int128", () => tokens.push({ token: Token.disc.Int, size: 128 })],
    ["int136", () => tokens.push({ token: Token.disc.Int, size: 136 })],
    ["int144", () => tokens.push({ token: Token.disc.Int, size: 144 })],
    ["int152", () => tokens.push({ token: Token.disc.Int, size: 152 })],
    ["int160", () => tokens.push({ token: Token.disc.Int, size: 160 })],
    ["int168", () => tokens.push({ token: Token.disc.Int, size: 168 })],
    ["int176", () => tokens.push({ token: Token.disc.Int, size: 176 })],
    ["int184", () => tokens.push({ token: Token.disc.Int, size: 184 })],
    ["int192", () => tokens.push({ token: Token.disc.Int, size: 192 })],
    ["int200", () => tokens.push({ token: Token.disc.Int, size: 200 })],
    ["int208", () => tokens.push({ token: Token.disc.Int, size: 208 })],
    ["int216", () => tokens.push({ token: Token.disc.Int, size: 216 })],
    ["int224", () => tokens.push({ token: Token.disc.Int, size: 224 })],
    ["int232", () => tokens.push({ token: Token.disc.Int, size: 232 })],
    ["int240", () => tokens.push({ token: Token.disc.Int, size: 240 })],
    ["int248", () => tokens.push({ token: Token.disc.Int, size: 248 })],
    ["int256", () => tokens.push({ token: Token.disc.Int, size: 256 })],
    ["uint8", () => tokens.push({ token: Token.disc.Uint, size: 8 })],
    ["uint16", () => tokens.push({ token: Token.disc.Uint, size: 16 })],
    ["uint24", () => tokens.push({ token: Token.disc.Uint, size: 24 })],
    ["uint32", () => tokens.push({ token: Token.disc.Uint, size: 32 })],
    ["uint40", () => tokens.push({ token: Token.disc.Uint, size: 40 })],
    ["uint48", () => tokens.push({ token: Token.disc.Uint, size: 48 })],
    ["uint56", () => tokens.push({ token: Token.disc.Uint, size: 56 })],
    ["uint64", () => tokens.push({ token: Token.disc.Uint, size: 64 })],
    ["uint72", () => tokens.push({ token: Token.disc.Uint, size: 72 })],
    ["uint80", () => tokens.push({ token: Token.disc.Uint, size: 80 })],
    ["uint88", () => tokens.push({ token: Token.disc.Uint, size: 88 })],
    ["uint96", () => tokens.push({ token: Token.disc.Uint, size: 96 })],
    ["uint104", () => tokens.push({ token: Token.disc.Uint, size: 104 })],
    ["uint112", () => tokens.push({ token: Token.disc.Uint, size: 112 })],
    ["uint120", () => tokens.push({ token: Token.disc.Uint, size: 120 })],
    ["uint128", () => tokens.push({ token: Token.disc.Uint, size: 128 })],
    ["uint136", () => tokens.push({ token: Token.disc.Uint, size: 136 })],
    ["uint144", () => tokens.push({ token: Token.disc.Uint, size: 144 })],
    ["uint152", () => tokens.push({ token: Token.disc.Uint, size: 152 })],
    ["uint160", () => tokens.push({ token: Token.disc.Uint, size: 160 })],
    ["uint168", () => tokens.push({ token: Token.disc.Uint, size: 168 })],
    ["uint176", () => tokens.push({ token: Token.disc.Uint, size: 176 })],
    ["uint184", () => tokens.push({ token: Token.disc.Uint, size: 184 })],
    ["uint192", () => tokens.push({ token: Token.disc.Uint, size: 192 })],
    ["uint200", () => tokens.push({ token: Token.disc.Uint, size: 200 })],
    ["uint208", () => tokens.push({ token: Token.disc.Uint, size: 208 })],
    ["uint216", () => tokens.push({ token: Token.disc.Uint, size: 216 })],
    ["uint224", () => tokens.push({ token: Token.disc.Uint, size: 224 })],
    ["uint232", () => tokens.push({ token: Token.disc.Uint, size: 232 })],
    ["uint240", () => tokens.push({ token: Token.disc.Uint, size: 240 })],
    ["uint248", () => tokens.push({ token: Token.disc.Uint, size: 248 })],
    ["uint256", () => tokens.push({ token: Token.disc.Uint, size: 256 })],
    ["bytes1", () => tokens.push({ token: Token.disc.Byte, size: 1 })],
    ["bytes2", () => tokens.push({ token: Token.disc.Byte, size: 2 })],
    ["bytes3", () => tokens.push({ token: Token.disc.Byte, size: 3 })],
    ["bytes4", () => tokens.push({ token: Token.disc.Byte, size: 4 })],
    ["bytes5", () => tokens.push({ token: Token.disc.Byte, size: 5 })],
    ["bytes6", () => tokens.push({ token: Token.disc.Byte, size: 6 })],
    ["bytes7", () => tokens.push({ token: Token.disc.Byte, size: 7 })],
    ["bytes8", () => tokens.push({ token: Token.disc.Byte, size: 8 })],
    ["bytes9", () => tokens.push({ token: Token.disc.Byte, size: 9 })],
    ["bytes10", () => tokens.push({ token: Token.disc.Byte, size: 10 })],
    ["bytes11", () => tokens.push({ token: Token.disc.Byte, size: 11 })],
    ["bytes12", () => tokens.push({ token: Token.disc.Byte, size: 12 })],
    ["bytes13", () => tokens.push({ token: Token.disc.Byte, size: 13 })],
    ["bytes14", () => tokens.push({ token: Token.disc.Byte, size: 14 })],
    ["bytes15", () => tokens.push({ token: Token.disc.Byte, size: 15 })],
    ["bytes16", () => tokens.push({ token: Token.disc.Byte, size: 16 })],
    ["bytes17", () => tokens.push({ token: Token.disc.Byte, size: 17 })],
    ["bytes18", () => tokens.push({ token: Token.disc.Byte, size: 18 })],
    ["bytes19", () => tokens.push({ token: Token.disc.Byte, size: 19 })],
    ["bytes20", () => tokens.push({ token: Token.disc.Byte, size: 20 })],
    ["bytes21", () => tokens.push({ token: Token.disc.Byte, size: 21 })],
    ["bytes22", () => tokens.push({ token: Token.disc.Byte, size: 22 })],
    ["bytes23", () => tokens.push({ token: Token.disc.Byte, size: 23 })],
    ["bytes24", () => tokens.push({ token: Token.disc.Byte, size: 24 })],
    ["bytes25", () => tokens.push({ token: Token.disc.Byte, size: 25 })],
    ["bytes26", () => tokens.push({ token: Token.disc.Byte, size: 26 })],
    ["bytes27", () => tokens.push({ token: Token.disc.Byte, size: 27 })],
    ["bytes28", () => tokens.push({ token: Token.disc.Byte, size: 28 })],
    ["bytes29", () => tokens.push({ token: Token.disc.Byte, size: 29 })],
    ["bytes30", () => tokens.push({ token: Token.disc.Byte, size: 30 })],
    ["bytes31", () => tokens.push({ token: Token.disc.Byte, size: 31 })],
    ["bytes32", () => tokens.push({ token: Token.disc.Byte, size: 32 })],
    [
      "after",
      () => {
        throw new Error('"after" is a reserved keyword.');
      },
    ],
    [
      "alias",
      () => {
        throw new Error('"alias" is a reserved keyword.');
      },
    ],
    [
      "apply",
      () => {
        throw new Error('"apply" is a reserved keyword.');
      },
    ],
    [
      "auto",
      () => {
        throw new Error('"auto" is a reserved keyword.');
      },
    ],
    [
      "byte",
      () => {
        throw new Error('"byte" is a reserved keyword.');
      },
    ],
    [
      "copyof",
      () => {
        throw new Error('"copyof" is a reserved keyword.');
      },
    ],
    [
      "define",
      () => {
        throw new Error('"define" is a reserved keyword.');
      },
    ],
    [
      "final",
      () => {
        throw new Error('"final" is a reserved keyword.');
      },
    ],
    [
      "implements",
      () => {
        throw new Error('"implements" is a reserved keyword.');
      },
    ],
    [
      "in",
      () => {
        throw new Error('"in" is a reserved keyword.');
      },
    ],
    [
      "inline",
      () => {
        throw new Error('"inline" is a reserved keyword.');
      },
    ],
    [
      "macro",
      () => {
        throw new Error('"macro" is a reserved keyword.');
      },
    ],
    [
      "match",
      () => {
        throw new Error('"match" is a reserved keyword.');
      },
    ],
    [
      "mutable",
      () => {
        throw new Error('"mutable" is a reserved keyword.');
      },
    ],
    [
      "null",
      () => {
        throw new Error('"null" is a reserved keyword.');
      },
    ],
    [
      "of",
      () => {
        throw new Error('"of" is a reserved keyword.');
      },
    ],
    [
      "partial",
      () => {
        throw new Error('"partial" is a reserved keyword.');
      },
    ],
    [
      "promise",
      () => {
        throw new Error('"promise" is a reserved keyword.');
      },
    ],
    [
      "reference",
      () => {
        throw new Error('"reference" is a reserved keyword.');
      },
    ],
    [
      "relocatable",
      () => {
        throw new Error('"relocatable" is a reserved keyword.');
      },
    ],
    [
      "sealed",
      () => {
        throw new Error('"sealed" is a reserved keyword.');
      },
    ],
    [
      "sizeof",
      () => {
        throw new Error('"sizeof" is a reserved keyword.');
      },
    ],
    [
      "static",
      () => {
        throw new Error('"static" is a reserved keyword.');
      },
    ],
    [
      "supports",
      () => {
        throw new Error('"supports" is a reserved keyword.');
      },
    ],
    [
      "typedef",
      () => {
        throw new Error('"typedef" is a reserved keyword.');
      },
    ],
    [
      "typeof",
      () => {
        throw new Error('"typeof" is a reserved keyword.');
      },
    ],
    [
      "var",
      () => {
        throw new Error('"var" is a reserved keyword.');
      },
    ],
  ]);

  for (const char of cursor) {
    if (isEmpty(char)) continue;

    if (symbolMap.has(char)) {
      symbolMap.get(char)!();
    } else if (char === '"') {
      // TODO(kyle) string literal
    } else if (isDigit(char)) {
      // TODO(kyle) rational number literal
      // TODO(kyle) hex number literal

      if (char === "0" && cursor.peek() === "x") {
        cursor.next();

        let length = 2;
        for (const char of cursor) {
          if (isHex(char)) length++;
          else {
            cursor.position--;
            break;
          }
        }

        if (length === 42) {
          tokens.push({
            token: Token.disc.AddressLiteral,
            value: source.substring(cursor.position - length, cursor.position) as Hex,
          });
        }
      } else {
        let length = 1;
        for (const char of cursor) {
          if (isDigit(char)) length++;
          else {
            cursor.position--;
            break;
          }
        }

        tokens.push({
          token: Token.disc.NumberLiteral,
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
          break;
        }
      }

      const lexeme = source.substring(cursor.position - length, cursor.position);

      if (keywordMap.has(lexeme)) {
        keywordMap.get(lexeme)!();
      } else {
        tokens.push({ token: Token.disc.Identifier, value: lexeme });
      }
    } else {
      throw new UnrecognizedSymbolError({ symbol: char });
    }
  }

  return tokens;
};
