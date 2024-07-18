import { expect, test } from "bun:test";
import { tokenize } from "./lexer";
import { Token } from "./types/token";

test("identifier", () => {
  const tokens = tokenize("hi");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});

test.todo("string literal");

test("bool literal", () => {
  const tokens = tokenize("true");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.BoolLiteral);
  expect((tokens[0] as Token.BoolLiteral)?.value).toBe(true);
});

test("number literal", () => {
  const tokens = tokenize("898");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.NumberLiteral);
  expect((tokens[0] as Token.NumberLiteral)?.value).toBe(898n);
});

test.todo("rational number literal");

test.todo("hex number literal");

test.todo("address literal");

test("empty", () => {
  const tokens = tokenize("");

  expect(tokens).toHaveLength(0);
});

test("whitespace", () => {
  const tokens = tokenize(" hi ");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});

test("comments", () => {
  const tokens = tokenize(`//   
  hi/* ho */hi
`);

  expect(tokens).toHaveLength(2);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});
