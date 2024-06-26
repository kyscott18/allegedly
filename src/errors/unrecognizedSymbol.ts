export type UnrecognizedSymbolErrorType = UnrecognizedSymbolError & {
  name: "UnrecognizedSymbolError";
};
export class UnrecognizedSymbolError extends Error {
  override name = "UnrecognizedSymbolError";
  constructor({ symbol }: { symbol: string }) {
    super(`Unrecognized symbol: "${symbol}"`);
  }
}
