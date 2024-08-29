import { expect, test } from "bun:test";
import path from "node:path";
import { tokenize } from "./lexer";
import { Token } from "./types/token";

test("symbol", () => {
  const tokens = tokenize(".++");

  expect(tokens).toHaveLength(2);
});

test("identifier", () => {
  const tokens = tokenize("hi");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});

test.todo("string literal");

test("bool literal", () => {
  const tokens = tokenize("true");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.BoolLiteral);
  expect((tokens[0] as Token.BoolLiteral)?.value).toBe(true);
});

test("number literal", () => {
  const tokens = tokenize("898");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.NumberLiteral);
  expect((tokens[0] as Token.NumberLiteral)?.value).toBe(898n);
});

test.todo("rational number literal");

test.todo("hex number literal");

test("address literal", () => {
  const tokens = tokenize("0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.AddressLiteral);
  expect((tokens[0] as Token.AddressLiteral)?.value).toBe(
    "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
  );
});

test("empty", () => {
  const tokens = tokenize("");

  expect(tokens).toHaveLength(0);
});

test("whitespace", () => {
  const tokens = tokenize(" hi ");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});

test("comments", () => {
  const tokens = tokenize(`//   
  hi/* ho */hi
`);

  expect(tokens).toHaveLength(2);
  expect(tokens[0]?.token).toBe(Token.disc.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");
});

test("integration", async () => {
  tokenize(await Bun.file(path.join(import.meta.dir, "_sol", "SimpleStorage.sol")).text());
  // tokenize(await Bun.file(path.join(import.meta.dir, "_sol", "Erc20.sol")).text());
});
