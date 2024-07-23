import type { Token } from "../types/token";

export type UnexpectTokenErrorType = UnexpectTokenError & {
  name: "UnexpectTokenError";
};
export class UnexpectTokenError extends Error {
  override name = "UnexpectTokenError";
  constructor(token: Token.Token) {
    super(`Unexpected token: "${JSON.stringify(token, null, 2)}".`);
  }
}
