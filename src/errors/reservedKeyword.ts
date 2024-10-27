import type { SourceLocation } from "../types/utils";
import { frame, recoverSource } from "../utils/frame";

export type ReservedKeywordErrorType = ReservedKeywordError & {
  name: "ReservedKeywordError";
};
export class ReservedKeywordError extends Error {
  override name = "ReservedKeywordError";
  constructor({ source, loc }: { source: string; loc: SourceLocation }) {
    super();
    this.cause = frame(source, loc, `"${recoverSource(source, loc)}" is a reserved keyword.`);
    this.stack = undefined;
  }
}
