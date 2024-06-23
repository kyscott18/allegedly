import { NotImplementedError } from "./errors/notImplemented";
import type { Token } from "./types/token";
import { type Cursor, createCursor } from "./utils/cursor";

const isEmpty = (char: string) => char === " " || char === "\t" || char === "\n";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isChar = (char: string) =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";

export type Lexer = {
  peek: Cursor["peek"];
  readNextToken: () => Token.Token | undefined;
};

export const createLexer = (source: string): Lexer => {
  const cursor = createCursor(source);

  return {
    peek: cursor.peek,
    readNextToken: (): Token.Token | undefined => {
      // find next character, return if none
      let char: string | undefined;
      for (char of cursor) {
        if (isEmpty(char) === false) break;
      }
      if (char === undefined) return;

      if (char === "=") {
        return {
          type: "assign",
          start: cursor.position,
          end: cursor.position + 1,
        } satisfies Token.Assign;
      }

      if (char === "+") {
        return {
          type: "add",
          start: cursor.position,
          end: cursor.position + 1,
        } satisfies Token.Add;
      }

      if (char === "-") {
        return {
          type: "subtract",
          start: cursor.position,
          end: cursor.position + 1,
        } satisfies Token.Subtract;
      }

      if (isDigit(char)) {
        let lexeme = char;
        for (const char of cursor) {
          if (isDigit(char)) lexeme += char;
          else break;
        }

        // TODO(kyle) check if value can fit into `number`
        const value = Number(lexeme);

        return {
          type: "number",
          value,
          start: cursor.position,
          end: cursor.position + lexeme.length,
        } satisfies Token.NumberLiteral;
      }

      if (isChar(char)) {
        let lexeme = char;
        for (const char of cursor) {
          if (isChar(char)) lexeme += char;
          else break;
        }

        return matchWord(lexeme, cursor.position);
      }

      throw new NotImplementedError({ source: char });
    },
  };
};

const matchWord = (string: string, offset: number): Token.Token => {
  if (string === "if") {
    return { type: "if", start: offset, end: offset + 2 } satisfies Token.If;
  }
  return {
    type: "identifier",
    lexeme: string,
    start: offset,
    end: offset + string.length,
  } satisfies Token.Identifier;
};
