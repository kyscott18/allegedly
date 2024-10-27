import type { SourceLocation } from "../types/utils";
import { frame, recoverSource } from "../utils/frame";

export type UnrecognizedSymbolErrorType = UnrecognizedSymbolError & {
  name: "UnrecognizedSymbolError";
};
export class UnrecognizedSymbolError extends Error {
  override name = "UnrecognizedSymbolError";
  constructor({ source, loc }: { source: string; loc: SourceLocation }) {
    super();
    this.cause = frame(source, loc, `Unrecognized symbol: "${recoverSource(source, loc)}"`);
    this.stack = undefined;
  }
}
