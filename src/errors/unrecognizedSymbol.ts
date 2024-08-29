import type { SourceLocation } from "../types/utils";
import { frame } from "../utils/frame";

export type UnrecognizedSymbolErrorType = UnrecognizedSymbolError & {
  name: "UnrecognizedSymbolError";
};
export class UnrecognizedSymbolError extends Error {
  override name = "UnrecognizedSymbolError";
  constructor({ source, loc, symbol }: { source: string; loc: SourceLocation; symbol: string }) {
    super(`Unrecognized symbol: "${symbol}"`);

    frame(source, loc, `Unrecognized symbol: "${symbol}"`);
  }
}
