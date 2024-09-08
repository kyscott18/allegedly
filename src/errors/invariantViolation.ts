export type InvariantViolationErrorType = InvariantViolationError & {
  name: "InvariantViolationError";
};
export class InvariantViolationError extends Error {
  override name = "InvariantViolationError";
  constructor(message?: string) {
    super(`${message}`);
  }
}
