import type { Ast } from "../types/ast";
import { frame, recoverSource } from "../utils/frame";

export type UnexpectExpressionErrorType = UnexpectExpressionError & {
  name: "UnexpectExpressionError";
};
export class UnexpectExpressionError extends Error {
  override name = "UnexpectExpressionError";
  constructor({
    source,
    expression,
  }: { source: string; expression: Ast.Expression; expected: string }) {
    super();
    this.cause = frame(
      source,
      expression.loc,
      `Unexpected expression: "${recoverSource(source, expression.loc)}".`,
    );
    this.stack = undefined;
  }
}
