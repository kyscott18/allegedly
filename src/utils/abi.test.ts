import { expect, test } from "bun:test";
import { tokenize } from "../lexer";
import {
  type ParseContext,
  parseErrorDefinition,
  parseEventDefinition,
  parseFunctionDefinition,
  parseVariableDefinition,
} from "../parser";
import type { Ast } from "../types/ast";
import { getAbiError, getAbiEvent, getAbiFunction } from "./abi";

const getAst = (
  source: string,
  parser: (context: ParseContext) => Ast.Statement | Ast.Definition | Ast.Expression,
) => {
  return parser({ source, tokens: tokenize(source), tokenIndex: 0 });
};

test("getFunctionAbi() function", () => {
  const node = getAst(
    `
function fn() external view returns (uint256) {
  return 10;
}`,
    parseFunctionDefinition,
  );

  const abiFunction = getAbiFunction(node as Ast.FunctionDefinition);

  expect(abiFunction).toBeDefined();
  expect(abiFunction.name).toBe("fn");
  expect(abiFunction.inputs).toStrictEqual([]);
  expect(abiFunction.outputs).toHaveLength(1);
  expect(abiFunction.stateMutability).toBe("view");
});

test("getFunctionAbi() variable", () => {
  const node = getAst("uint256 x;", parseVariableDefinition);

  const abiFunction = getAbiFunction(node as Ast.VariableDefintion);

  expect(abiFunction).toBeDefined();
  expect(abiFunction.name).toBe("x");
  expect(abiFunction.inputs).toStrictEqual([]);
  expect(abiFunction.outputs).toHaveLength(1);
  expect(abiFunction.stateMutability).toBe("view");
});

test("getErrorAbi()", () => {
  const node = getAst("error BadError();", parseErrorDefinition);

  const abiError = getAbiError(node as Ast.ErrorDefinition);

  expect(abiError).toBeDefined();
  expect(abiError.name).toBe("BadError");
  expect(abiError.inputs).toStrictEqual([]);
});

test("getEventAbi()", () => {
  const node = getAst("event Ping();", parseEventDefinition);

  const abiEvent = getAbiEvent(node as Ast.EventDefinition);

  expect(abiEvent).toBeDefined();
  expect(abiEvent.name).toBe("Ping");
  expect(abiEvent.inputs).toStrictEqual([]);
});
