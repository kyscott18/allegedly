import { BaseError } from "./base";

export type _2271ErrorType = BaseError & { name: "2271Error"; code: 2271 };
export class _2271Error extends BaseError {
  override name = "2271Error";

  constructor() {
    super("", 2271);
  }
}
