export type NotImplementedErrorType = NotImplementedError & {
  name: "NotImplementedError";
};
export class NotImplementedError extends Error {
  override name = "NotImplementedError";
  constructor({ source }: { source: string }) {
    super(
      `"${source}" is a feature of solidity that has not yet been implemented into this compiler.`,
    );
  }
}
