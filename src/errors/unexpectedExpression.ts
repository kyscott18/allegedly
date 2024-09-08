import type { Ast } from "../types/ast";
import { recoverSource } from "../utils/frame";

export type UnexpectExpressionErrorType = UnexpectExpressionError & {
  name: "UnexpectExpressionError";
};
export class UnexpectExpressionError extends Error {
  override name = "UnexpectExpressionError";
  constructor({
    source,
    expression,
  }: { source: string; expression: Ast.Expression; expected: string }) {
    const _token = recoverSource(source, expression.loc);
    super(`Unexpected expression: "${_token}".`);
  }
}
