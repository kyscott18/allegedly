import { expect, test } from "bun:test";
import path from "node:path";
import { tokenize } from "./lexer";
import { Token } from "./types/token";
import { readdirSync } from "node:fs";

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

test("string literal", () => {
  const tokens = tokenize(`"allegedly"`);

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.StringLiteral);
  expect((tokens[0] as Token.StringLiteral)?.value).toBe(`"allegedly"`);
});

test("bool literal", () => {
  const tokens = tokenize("true");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.BoolLiteral);
  expect((tokens[0] as Token.BoolLiteral)?.value).toBe("true");
});

test("number literal", () => {
  const tokens = tokenize("898");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.NumberLiteral);
  expect((tokens[0] as Token.NumberLiteral)?.value).toBe("898");
});

test("hex number literal", () => {
  const tokens = tokenize("0xffff");

  expect(tokens).toHaveLength(1);
  expect(tokens[0]?.token).toBe(Token.disc.HexNumberLiteral);
  expect((tokens[0] as Token.HexNumberLiteral)?.value).toBe("0xffff");
});

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
  let tokens = tokenize(`//   
  hi/* ho */hi
`);

  expect(tokens).toHaveLength(2);
  expect(tokens[0]?.token).toBe(Token.disc.Identifier);
  expect((tokens[0] as Token.Identifier)?.value).toBe("hi");

  tokens = tokenize(`
/*//////////////////////////////////////////////////////////////
                          COMMENTS
//////////////////////////////////////////////////////////////*/
`);

  expect(tokens).toHaveLength(0);
});

test("integration", async () => {
  const files = readdirSync(path.join(import.meta.dir, "_sol"));
  for (const file of files) {
    tokenize(await Bun.file(path.join(import.meta.dir, "_sol", file)).text());
  }
});
