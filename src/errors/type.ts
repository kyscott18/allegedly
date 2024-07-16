export type TypeErrorType = TypeError & { name: "TypeError" };
export class TypeError extends Error {
  override name = "TypeError";

  code: number;

  // TODO(kyle) version

  constructor(message: string, code: number) {
    super();
    this.message = message;
    this.code = code;
  }
}
