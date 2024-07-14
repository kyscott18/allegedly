export type BaseErrorType = BaseError & { name: "BaseError" };
export class BaseError extends Error {
  override name = "BaseError";

  code: number;

  // TODO(kyle) version

  constructor(message: string, code: number) {
    super();
    this.message = message;
    this.code = code;
  }
}
