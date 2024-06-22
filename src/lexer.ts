import { NotImplementedError } from "./errors/notImplemented.ts";
import type { Assignment, Identifier, If, Minus, Number, Plus, Token } from "./types/token.js";
import { createCursor } from "./utils/cursor.ts";

const isEmpty = (char: string) => char === " " || char === "\t" || char === "\n";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isChar = (char: string) => char >= "A" && char <= "z";

export type Lexer = {
  readNextToken: () => Token | undefined;
  peek: () => string | undefined;
};

export const createLexer = (source: string): Lexer => {
  const cursor = createCursor(source);

  return {
    peek: cursor.peek,
    readNextToken: () => {
      // find next character, return if none
      let char: string | undefined;
      for (char of cursor) {
        if (isEmpty(char) === false) break;
      }
      if (char === undefined) return;

      if (char === "=") {
        return {
          type: "assignment",
          start: cursor.position,
          end: cursor.position + 1,
        } satisfies Assignment;
      }

      if (char === "+") {
        return {
          type: "plus",
          start: cursor.position,
          end: cursor.position + 1,
        } satisfies Plus;
      }

      if (char === "-") {
        return {
          type: "minus",
          start: cursor.position,
          end: cursor.position + 1,
        } satisfies Minus;
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
        } satisfies Number;
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

const matchWord = (string: string, offset: number): Token => {
  if (string === "if") {
    return { type: "if", start: offset, end: offset + 2 } satisfies If;
  }
  return {
    type: "identifier",
    lexeme: string,
    start: offset,
    end: offset + string.length,
  } satisfies Identifier;
};
