import type { Token } from "../types/token";
import { frame, recoverSource } from "../utils/frame";

export type ExpectTokenErrorType = ExpectTokenError & {
  name: "ExpectTokenError";
};
export class ExpectTokenError extends Error {
  override name = "ExpectTokenError";
  constructor({
    source,
    expected,
    received,
  }: { source: string; expected: Token.disc; received: Token.Token | undefined }) {
    if (received === undefined) {
      super(`Expected "${expected}", but reached end of file".`);
    } else {
      super();
      this.cause = frame(
        source,
        received.loc,
        `Expected "${expected}", received "${recoverSource(source, received.loc)}".`,
      );
      this.stack = undefined;
    }
  }
}
