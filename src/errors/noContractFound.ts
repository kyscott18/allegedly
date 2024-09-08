export type NoContractFoundErrorType = NoContractFoundError & {
  name: "NoContractFoundError";
};
export class NoContractFoundError extends Error {
  override name = "NoContractFoundError";
  constructor() {
    super("No contract found.");
  }
}
