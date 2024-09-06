import type { SourceLocation } from "../types/utils";
import { frame, recoverSource } from "../utils/frame";

export type ReservedKeywordErrorType = ReservedKeywordError & {
  name: "ReservedKeywordError";
};
export class ReservedKeywordError extends Error {
  override name = "ReservedKeywordError";
  constructor({ source, loc }: { source: string; loc: SourceLocation }) {
    const keyword = recoverSource(source, loc);
    super(`"${keyword}" is a reserved keyword.`);

    console.log(frame(source, loc, `"${keyword}" is a reserved keyword.`));
  }
}
