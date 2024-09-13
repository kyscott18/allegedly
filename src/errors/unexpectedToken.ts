import type { Token } from "../types/token";
import { recoverSource } from "../utils/frame";

export type UnexpectTokenErrorType = UnexpectTokenError & {
  name: "UnexpectTokenError";
};
export class UnexpectTokenError extends Error {
  override name = "UnexpectTokenError";
  constructor({ source, token }: { source: string; token: Token.Token }) {
    super(`Unexpected token: "${recoverSource(source, token.loc)}".`);
  }
}
