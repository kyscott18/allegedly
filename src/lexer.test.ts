import { expect, test } from "bun:test";
import { tokenize } from "./lexer";
import { Token } from "./types/token";

test("identifier", () => {
  const tokens = tokenize("hi");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});

test("number literal", () => {
  const tokens = tokenize("898");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.NumberLiteral);
  expect((tokens[0] as Token.NumberLiteral)?.value).toBe("898");
});

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
