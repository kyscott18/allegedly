import { NotImplementedError } from "./errors/notImplemented";
import type { Token } from "./types/token";
import { createCursor } from "./utils/cursor";

const isEmpty = (char: string) => char === " " || char === "\t" || char === "\n";
const isDigit = (char: string) => char >= "0" && char <= "9";
const isChar = (char: string) =>
  (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";

export const tokenize = (source: string): Token.Token[] => {
  const cursor = createCursor(source);
  const tokens: Token.Token[] = [];

  for (const char of cursor) {
    if (isEmpty(char)) continue;

    if (char === "=") {
      tokens.push({
        type: "assign",
      } satisfies Token.Assign);
    }

    if (char === "+") {
      tokens.push({
        type: "add",
      } satisfies Token.Add);
    }

    if (char === "-") {
      tokens.push({
        type: "subtract",
      } satisfies Token.Subtract);
    }

    if (isDigit(char)) {
      let lexeme = char;
      for (const char of cursor) {
        if (isDigit(char)) lexeme += char;
        else break;
      }

      // TODO(kyle) check if value can fit into `number`
      const value = Number(lexeme);

      tokens.push({
        type: "number",
        value,
      } satisfies Token.NumberLiteral);
    }

    if (isChar(char)) {
      let lexeme = char;
      for (const char of cursor) {
        if (isChar(char)) lexeme += char;
        else break;
      }

      tokens.push(matchWord(lexeme));
    }

    throw new NotImplementedError({ source: char });
  }

  return tokens;
};

const matchWord = (string: string): Token.Token => {
  if (string === "if") {
    return { type: "if" } satisfies Token.If;
  }
  return {
    type: "identifier",
    lexeme: string,
  } satisfies Token.Identifier;
};
