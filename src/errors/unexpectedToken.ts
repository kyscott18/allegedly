import type { Token } from "../types/token";
import { frame, recoverSource } from "../utils/frame";

export type UnexpectTokenErrorType = UnexpectTokenError & {
  name: "UnexpectTokenError";
};
export class UnexpectTokenError extends Error {
  override name = "UnexpectTokenError";
  constructor({ source, token }: { source: string; token: Token.Token }) {
    super();
    this.cause = frame(
      source,
      token.loc,
      `Unexpected token: "${recoverSource(source, token.loc)}".`,
    );
    this.stack = undefined;
  }
}
