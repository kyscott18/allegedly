import type { SourceLocation } from "../types/utils";
import { recoverSource } from "../utils/frame";

export type UnrecognizedSymbolErrorType = UnrecognizedSymbolError & {
  name: "UnrecognizedSymbolError";
};
export class UnrecognizedSymbolError extends Error {
  override name = "UnrecognizedSymbolError";
  constructor({ source, loc }: { source: string; loc: SourceLocation }) {
    const symbol = recoverSource(source, loc);

    super(`Unrecognized symbol: "${symbol}"`);

    // frame(source, loc, `Unrecognized symbol: "${symbol}"`);
  }
}
