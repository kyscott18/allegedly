import { expect, test } from "bun:test";
import { tokenize } from "./lexer";
import { Token } from "./types/token";

test("identifier", () => {
  const tokens = tokenize("hi");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect(tokens[0]?.value).toBe("hi");
});

test("number literal", () => {
  const tokens = tokenize("898");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.NumberLiteral);
  expect(tokens[0]?.value).toBe("898");
});

test("empty", () => {
  const tokens = tokenize("");

  expect(tokens).toHaveLength(0);
});

test("whitespace", () => {
  const tokens = tokenize(" hi ");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect(tokens[0]?.value).toBe("hi");
});

test("comments", () => {
  const tokens = tokenize(`//   
  hi/* ho */hi
`);

  expect(tokens).toHaveLength(2);
  expect(tokens[0]?.token).toBe(Token.TokenType.Identifier);
  expect(tokens[0]?.value).toBe("hi");
});

test("ERC20", async () => {
  const source = await Bun.file("/Users/kylescott/src/allegedly/src/_sol/ERC20.sol").text();
  tokenize(source);
});
