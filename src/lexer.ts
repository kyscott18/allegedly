import { UnrecognizedSymbolError } from "./errors/unrecognizedSymbol";
import { Token } from "./types/token";
import { createCursor } from "./utils/cursor";

const isEmpty = (char: string) => char === " " || char === "\t" || char === "\n" || char === "";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isIndentifierStart = (char: string) =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";
const isIdentifier = (char: string) => isIndentifierStart(char) || isDigit(char);

export const tokenize = (source: string): Token.Token[] => {
  const cursor = createCursor(source);
  const tokens: Token.Token[] = [];

  const symbolMap = new Map<string, () => void>([
    [".", () => tokens.push({ token: Token.TokenType.Member })],
    [",", () => tokens.push({ token: Token.TokenType.Comma })],
    ["?", () => tokens.push({ token: Token.TokenType.Question })],
    ["(", () => tokens.push({ token: Token.TokenType.OpenParenthesis })],
    [")", () => tokens.push({ token: Token.TokenType.CloseParenthesis })],
    ["{", () => tokens.push({ token: Token.TokenType.OpenCurlyBrace })],
    ["}", () => tokens.push({ token: Token.TokenType.CloseCurlyBrace })],
    ["[", () => tokens.push({ token: Token.TokenType.OpenBracket })],
    ["]", () => tokens.push({ token: Token.TokenType.CloseBracket })],
    [";", () => tokens.push({ token: Token.TokenType.Semicolon })],
    ["~", () => tokens.push({ token: Token.TokenType.BitwiseNot })],
    [
      ":",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.ColonAssign });
        } else {
          tokens.push({ token: Token.TokenType.Colon });
        }
      },
    ],
    [
      "=",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Equal });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Arrow });
        } else {
          tokens.push({ token: Token.TokenType.Assign });
        }
      },
    ],
    [
      "+",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.AddAssign });
        } else if (cursor.peek() === "+") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Increment });
        } else {
          tokens.push({ token: Token.TokenType.Add });
        }
      },
    ],
    [
      "-",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.SubtractAssign });
        } else if (cursor.peek() === "-") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Decrement });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.YulArrow });
        } else {
          tokens.push({ token: Token.TokenType.Subtract });
        }
      },
    ],
    [
      "*",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.MulAssign });
        } else if (cursor.peek() === "*") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Power });
        } else {
          tokens.push({ token: Token.TokenType.Mul });
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
          tokens.push({ token: Token.TokenType.DivideAssign });
        } else {
          tokens.push({ token: Token.TokenType.Divide });
        }
      },
    ],
    [
      "%",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.ModuloAssign });
        } else {
          tokens.push({ token: Token.TokenType.Modulo });
        }
      },
    ],
    [
      "&",
      () => {
        if (cursor.peek() === "&") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.And });
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.BitwiseAndAssign });
        } else {
          tokens.push({ token: Token.TokenType.BitwiseAnd });
        }
      },
    ],
    [
      "|",
      () => {
        if (cursor.peek() === "|") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.Or });
        } else if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.BitwiseOrAssign });
        } else {
          tokens.push({ token: Token.TokenType.BitwiseOr });
        }
      },
    ],
    [
      "^",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.BitwiseXOrAssign });
        } else {
          tokens.push({ token: Token.TokenType.BitwiseXOr });
        }
      },
    ],

    [
      ">",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.MoreEqual });
        } else if (cursor.peek() === ">") {
          cursor.position++;
          if (cursor.peek() === "=") {
            cursor.position++;
            tokens.push({ token: Token.TokenType.ShiftRightAssign });
          } else {
            tokens.push({ token: Token.TokenType.ShiftRight });
          }
        } else {
          tokens.push({ token: Token.TokenType.More });
        }
      },
    ],
    [
      "<",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.LessEqual });
        } else if (cursor.peek() === "<") {
          cursor.position++;
          if (cursor.peek() === "=") {
            cursor.position++;
            tokens.push({ token: Token.TokenType.ShiftLeftAssign });
          } else {
            tokens.push({ token: Token.TokenType.ShiftLeft });
          }
        } else {
          tokens.push({ token: Token.TokenType.Less });
        }
      },
    ],
    [
      "!",
      () => {
        if (cursor.peek() === "=") {
          cursor.position++;
          tokens.push({ token: Token.TokenType.NotEqual });
        } else {
          tokens.push({ token: Token.TokenType.Not });
        }
      },
    ],
  ]);

  const keywordMap = new Map<string, () => void>([
    ["true", () => tokens.push({ token: Token.TokenType.BoolLiteral, value: true })],
    ["false", () => tokens.push({ token: Token.TokenType.BoolLiteral, value: false })],
    ["if", () => tokens.push({ token: Token.TokenType.If })],
    ["else", () => tokens.push({ token: Token.TokenType.Else })],
    ["while", () => tokens.push({ token: Token.TokenType.While })],
    ["do", () => tokens.push({ token: Token.TokenType.Do })],
    ["for", () => tokens.push({ token: Token.TokenType.For })],
    ["break", () => tokens.push({ token: Token.TokenType.Break })],
    ["continue", () => tokens.push({ token: Token.TokenType.Continue })],
    ["switch", () => tokens.push({ token: Token.TokenType.Switch })],
    ["case", () => tokens.push({ token: Token.TokenType.Case })],
    ["default", () => tokens.push({ token: Token.TokenType.Default })],
    ["return", () => tokens.push({ token: Token.TokenType.Return })],
    ["calldata", () => tokens.push({ token: Token.TokenType.Calldata })],
    ["memory", () => tokens.push({ token: Token.TokenType.Memory })],
    ["storage", () => tokens.push({ token: Token.TokenType.Storage })],
    ["immutable", () => tokens.push({ token: Token.TokenType.Immutable })],
    ["constant", () => tokens.push({ token: Token.TokenType.Constant })],
    ["contract", () => tokens.push({ token: Token.TokenType.Contract })],
    ["abstract", () => tokens.push({ token: Token.TokenType.Abstract })],
    ["interface", () => tokens.push({ token: Token.TokenType.Interface })],
    ["library", () => tokens.push({ token: Token.TokenType.Library })],
    ["pragma", () => tokens.push({ token: Token.TokenType.Pragma })],
    ["import", () => tokens.push({ token: Token.TokenType.Import })],
    ["from", () => tokens.push({ token: Token.TokenType.From })],
    ["using", () => tokens.push({ token: Token.TokenType.Using })],
    ["as", () => tokens.push({ token: Token.TokenType.As })],
    ["is", () => tokens.push({ token: Token.TokenType.Is })],
    ["function", () => tokens.push({ token: Token.TokenType.Function })],
    ["external", () => tokens.push({ token: Token.TokenType.External })],
    ["public", () => tokens.push({ token: Token.TokenType.Public })],
    ["internal", () => tokens.push({ token: Token.TokenType.Internal })],
    ["private", () => tokens.push({ token: Token.TokenType.Private })],
    ["view", () => tokens.push({ token: Token.TokenType.View })],
    ["pure", () => tokens.push({ token: Token.TokenType.Pure })],
    ["returns", () => tokens.push({ token: Token.TokenType.Returns })],
    ["payable", () => tokens.push({ token: Token.TokenType.Payable })],
    ["nonpayable", () => tokens.push({ token: Token.TokenType.Nonpayable })],
    ["virtual", () => tokens.push({ token: Token.TokenType.Virtual })],
    ["override", () => tokens.push({ token: Token.TokenType.Override })],
    ["constructor", () => tokens.push({ token: Token.TokenType.Constructor })],
    ["modifier", () => tokens.push({ token: Token.TokenType.Modifier })],
    ["receive", () => tokens.push({ token: Token.TokenType.Receive })],
    ["fallback", () => tokens.push({ token: Token.TokenType.Fallback })],
    ["unchecked", () => tokens.push({ token: Token.TokenType.Unchecked })],
    ["revert", () => tokens.push({ token: Token.TokenType.Revert })],
    ["assert", () => tokens.push({ token: Token.TokenType.Assert })],
    ["throw", () => tokens.push({ token: Token.TokenType.Throw })],
    ["try", () => tokens.push({ token: Token.TokenType.Try })],
    ["catch", () => tokens.push({ token: Token.TokenType.Catch })],
    ["event", () => tokens.push({ token: Token.TokenType.Event })],
    ["emit", () => tokens.push({ token: Token.TokenType.Emit })],
    ["indexed", () => tokens.push({ token: Token.TokenType.Indexed })],
    ["anonymous", () => tokens.push({ token: Token.TokenType.Anonymous })],
    ["new", () => tokens.push({ token: Token.TokenType.New })],
    ["delete", () => tokens.push({ token: Token.TokenType.Delete })],
    ["struct", () => tokens.push({ token: Token.TokenType.Struct })],
    ["enum", () => tokens.push({ token: Token.TokenType.Enum })],
    ["type", () => tokens.push({ token: Token.TokenType.Type })],
    ["mapping", () => tokens.push({ token: Token.TokenType.Mapping })],
    ["address", () => tokens.push({ token: Token.TokenType.Address })],
    ["string", () => tokens.push({ token: Token.TokenType.String })],
    ["bytes", () => tokens.push({ token: Token.TokenType.Bytes })],
    ["bool", () => tokens.push({ token: Token.TokenType.Bool })],
    ["assembly", () => tokens.push({ token: Token.TokenType.Assembly })],
    ["let", () => tokens.push({ token: Token.TokenType.Let })],
    ["leave", () => tokens.push({ token: Token.TokenType.Leave })],
    ["int8", () => tokens.push({ token: Token.TokenType.Int, size: 8 })],
    ["int16", () => tokens.push({ token: Token.TokenType.Int, size: 16 })],
    ["int24", () => tokens.push({ token: Token.TokenType.Int, size: 24 })],
    ["int32", () => tokens.push({ token: Token.TokenType.Int, size: 32 })],
    ["int40", () => tokens.push({ token: Token.TokenType.Int, size: 40 })],
    ["int48", () => tokens.push({ token: Token.TokenType.Int, size: 48 })],
    ["int56", () => tokens.push({ token: Token.TokenType.Int, size: 56 })],
    ["int64", () => tokens.push({ token: Token.TokenType.Int, size: 64 })],
    ["int72", () => tokens.push({ token: Token.TokenType.Int, size: 72 })],
    ["int80", () => tokens.push({ token: Token.TokenType.Int, size: 80 })],
    ["int88", () => tokens.push({ token: Token.TokenType.Int, size: 88 })],
    ["int96", () => tokens.push({ token: Token.TokenType.Int, size: 96 })],
    ["int104", () => tokens.push({ token: Token.TokenType.Int, size: 104 })],
    ["int112", () => tokens.push({ token: Token.TokenType.Int, size: 112 })],
    ["int120", () => tokens.push({ token: Token.TokenType.Int, size: 120 })],
    ["int128", () => tokens.push({ token: Token.TokenType.Int, size: 128 })],
    ["int136", () => tokens.push({ token: Token.TokenType.Int, size: 136 })],
    ["int144", () => tokens.push({ token: Token.TokenType.Int, size: 144 })],
    ["int152", () => tokens.push({ token: Token.TokenType.Int, size: 152 })],
    ["int160", () => tokens.push({ token: Token.TokenType.Int, size: 160 })],
    ["int168", () => tokens.push({ token: Token.TokenType.Int, size: 168 })],
    ["int176", () => tokens.push({ token: Token.TokenType.Int, size: 176 })],
    ["int184", () => tokens.push({ token: Token.TokenType.Int, size: 184 })],
    ["int192", () => tokens.push({ token: Token.TokenType.Int, size: 192 })],
    ["int200", () => tokens.push({ token: Token.TokenType.Int, size: 200 })],
    ["int208", () => tokens.push({ token: Token.TokenType.Int, size: 208 })],
    ["int216", () => tokens.push({ token: Token.TokenType.Int, size: 216 })],
    ["int224", () => tokens.push({ token: Token.TokenType.Int, size: 224 })],
    ["int232", () => tokens.push({ token: Token.TokenType.Int, size: 232 })],
    ["int240", () => tokens.push({ token: Token.TokenType.Int, size: 240 })],
    ["int248", () => tokens.push({ token: Token.TokenType.Int, size: 248 })],
    ["int256", () => tokens.push({ token: Token.TokenType.Int, size: 256 })],
    ["uint8", () => tokens.push({ token: Token.TokenType.Uint, size: 8 })],
    ["uint16", () => tokens.push({ token: Token.TokenType.Uint, size: 16 })],
    ["uint24", () => tokens.push({ token: Token.TokenType.Uint, size: 24 })],
    ["uint32", () => tokens.push({ token: Token.TokenType.Uint, size: 32 })],
    ["uint40", () => tokens.push({ token: Token.TokenType.Uint, size: 40 })],
    ["uint48", () => tokens.push({ token: Token.TokenType.Uint, size: 48 })],
    ["uint56", () => tokens.push({ token: Token.TokenType.Uint, size: 56 })],
    ["uint64", () => tokens.push({ token: Token.TokenType.Uint, size: 64 })],
    ["uint72", () => tokens.push({ token: Token.TokenType.Uint, size: 72 })],
    ["uint80", () => tokens.push({ token: Token.TokenType.Uint, size: 80 })],
    ["uint88", () => tokens.push({ token: Token.TokenType.Uint, size: 88 })],
    ["uint96", () => tokens.push({ token: Token.TokenType.Uint, size: 96 })],
    ["uint104", () => tokens.push({ token: Token.TokenType.Uint, size: 104 })],
    ["uint112", () => tokens.push({ token: Token.TokenType.Uint, size: 112 })],
    ["uint120", () => tokens.push({ token: Token.TokenType.Uint, size: 120 })],
    ["uint128", () => tokens.push({ token: Token.TokenType.Uint, size: 128 })],
    ["uint136", () => tokens.push({ token: Token.TokenType.Uint, size: 136 })],
    ["uint144", () => tokens.push({ token: Token.TokenType.Uint, size: 144 })],
    ["uint152", () => tokens.push({ token: Token.TokenType.Uint, size: 152 })],
    ["uint160", () => tokens.push({ token: Token.TokenType.Uint, size: 160 })],
    ["uint168", () => tokens.push({ token: Token.TokenType.Uint, size: 168 })],
    ["uint176", () => tokens.push({ token: Token.TokenType.Uint, size: 176 })],
    ["uint184", () => tokens.push({ token: Token.TokenType.Uint, size: 184 })],
    ["uint192", () => tokens.push({ token: Token.TokenType.Uint, size: 192 })],
    ["uint200", () => tokens.push({ token: Token.TokenType.Uint, size: 200 })],
    ["uint208", () => tokens.push({ token: Token.TokenType.Uint, size: 208 })],
    ["uint216", () => tokens.push({ token: Token.TokenType.Uint, size: 216 })],
    ["uint224", () => tokens.push({ token: Token.TokenType.Uint, size: 224 })],
    ["uint232", () => tokens.push({ token: Token.TokenType.Uint, size: 232 })],
    ["uint240", () => tokens.push({ token: Token.TokenType.Uint, size: 240 })],
    ["uint248", () => tokens.push({ token: Token.TokenType.Uint, size: 248 })],
    ["uint256", () => tokens.push({ token: Token.TokenType.Uint, size: 256 })],
    ["bytes1", () => tokens.push({ token: Token.TokenType.Byte, size: 1 })],
    ["bytes2", () => tokens.push({ token: Token.TokenType.Byte, size: 2 })],
    ["bytes3", () => tokens.push({ token: Token.TokenType.Byte, size: 3 })],
    ["bytes4", () => tokens.push({ token: Token.TokenType.Byte, size: 4 })],
    ["bytes5", () => tokens.push({ token: Token.TokenType.Byte, size: 5 })],
    ["bytes6", () => tokens.push({ token: Token.TokenType.Byte, size: 6 })],
    ["bytes7", () => tokens.push({ token: Token.TokenType.Byte, size: 7 })],
    ["bytes8", () => tokens.push({ token: Token.TokenType.Byte, size: 8 })],
    ["bytes9", () => tokens.push({ token: Token.TokenType.Byte, size: 9 })],
    ["bytes10", () => tokens.push({ token: Token.TokenType.Byte, size: 10 })],
    ["bytes11", () => tokens.push({ token: Token.TokenType.Byte, size: 11 })],
    ["bytes12", () => tokens.push({ token: Token.TokenType.Byte, size: 12 })],
    ["bytes13", () => tokens.push({ token: Token.TokenType.Byte, size: 13 })],
    ["bytes14", () => tokens.push({ token: Token.TokenType.Byte, size: 14 })],
    ["bytes15", () => tokens.push({ token: Token.TokenType.Byte, size: 15 })],
    ["bytes16", () => tokens.push({ token: Token.TokenType.Byte, size: 16 })],
    ["bytes17", () => tokens.push({ token: Token.TokenType.Byte, size: 17 })],
    ["bytes18", () => tokens.push({ token: Token.TokenType.Byte, size: 18 })],
    ["bytes19", () => tokens.push({ token: Token.TokenType.Byte, size: 19 })],
    ["bytes20", () => tokens.push({ token: Token.TokenType.Byte, size: 20 })],
    ["bytes21", () => tokens.push({ token: Token.TokenType.Byte, size: 21 })],
    ["bytes22", () => tokens.push({ token: Token.TokenType.Byte, size: 22 })],
    ["bytes23", () => tokens.push({ token: Token.TokenType.Byte, size: 23 })],
    ["bytes24", () => tokens.push({ token: Token.TokenType.Byte, size: 24 })],
    ["bytes25", () => tokens.push({ token: Token.TokenType.Byte, size: 25 })],
    ["bytes26", () => tokens.push({ token: Token.TokenType.Byte, size: 26 })],
    ["bytes27", () => tokens.push({ token: Token.TokenType.Byte, size: 27 })],
    ["bytes28", () => tokens.push({ token: Token.TokenType.Byte, size: 28 })],
    ["bytes29", () => tokens.push({ token: Token.TokenType.Byte, size: 29 })],
    ["bytes30", () => tokens.push({ token: Token.TokenType.Byte, size: 30 })],
    ["bytes31", () => tokens.push({ token: Token.TokenType.Byte, size: 31 })],
    ["bytes32", () => tokens.push({ token: Token.TokenType.Byte, size: 32 })],
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
        tokens.push({ token: Token.TokenType.Identifier, value: lexeme });
      }
    } else {
      throw new UnrecognizedSymbolError({ symbol: char });
    }
  }

  return tokens;
};
