import type { SourceLocation } from "../types/utils";
import { frame } from "../utils/frame";

export type NotImplementedErrorType = NotImplementedError & {
  name: "NotImplementedError";
};
export class NotImplementedError extends Error {
  override name = "NotImplementedError";
  constructor({ source, loc, feature }: { source: string; loc: SourceLocation; feature: string }) {
    super(
      `${feature} is a feature of solidity that has not yet been implemented into this compiler.`,
    );

    frame(
      source,
      loc,
      `${feature} is a feature of solidity that has not yet been implemented into this compiler.`,
    );
  }
}
