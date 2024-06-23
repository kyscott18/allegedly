import { expect, test } from "bun:test";
import { createLexer } from "./lexer";

test("identifier", () => {
  const lexer = createLexer("var");
  const token = lexer.readNextToken();

  expect(token).toBeDefined();
  expect(token!.type).toBe("identifier");
});

test("number", () => {
  const lexer = createLexer("898");
  const token = lexer.readNextToken();

  expect(token).toBeDefined();
  expect(token!.type).toBe("number");
});

test.todo("empty", () => {});

test.todo("whitespace", () => {});
