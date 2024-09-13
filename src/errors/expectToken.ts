import type { Token } from "../types/token";
import { recoverSource } from "../utils/frame";

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
      super(`Expected "${expected}", received "${recoverSource(source, received.loc)}".`);
    }
  }
}
