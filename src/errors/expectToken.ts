import type { Token } from "../types/token";

export type ExpectTokenErrorType = ExpectTokenError & {
  name: "ExpectTokenError";
};
export class ExpectTokenError extends Error {
  override name = "ExpectTokenError";
  constructor({
    expected,
    received,
  }: { expected: Token.TokenType; received: Token.TokenType | undefined }) {
    super(`Expected "${expected}", received "${received}".`);
  }
}
