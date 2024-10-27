import type { SourceLocation } from "../types/utils";
import { frame } from "../utils/frame";

export type TypeErrorType = TypeError & { name: "TypeError" };

export class TypeError extends Error {
  override name = "TypeError";
  code: number;

  // TODO(kyle) solidity version

  constructor({
    message,
    code,
    frame: _frame,
  }: {
    message: string;
    code: number;
    frame?: { source: string; loc: SourceLocation };
  }) {
    super();
    this.code = code;
    this.stack = undefined;

    if (_frame) {
      this.cause = frame(_frame.source, _frame.loc, `${message} - solidity(${code})`);
    } else {
      this.message = `${message} - solidity(${code})`;
    }
  }
}
