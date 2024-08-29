import type { SourceLocation } from "../types/utils";
import { frame } from "../utils/frame";

export type ReservedKeywordErrorType = ReservedKeywordError & {
  name: "ReservedKeywordError";
};
export class ReservedKeywordError extends Error {
  override name = "ReservedKeywordError";
  constructor({ source, loc, keyword }: { source: string; loc: SourceLocation; keyword: string }) {
    super(`"${keyword}" is a reserved keyword.`);

    frame(source, loc, `"${keyword}" is a reserved keyword.`);
  }
}
