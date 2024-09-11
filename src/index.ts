import type { Abi } from "viem";
import { check } from "./checker";
import { compile } from "./compiler";
import { NoContractFoundError } from "./errors/noContractFound";
import { tokenize } from "./lexer";
import { parse } from "./parser";
import { Ast } from "./types/ast";
import type { Hex } from "./types/utils";

export type SolReturnType = {
  name: string;
  abi: Abi;
  code: Hex;
};

/**
 * Compiles Solidity source code to EVM bytecode.
 *
 * @param source Source code of a Solidity program.
 */
export const sol = <const source extends string>(source: source): SolReturnType => {
  // Lexical analysis
  const tokens = tokenize(source);

  // Syntax analysis
  const program = parse(source, tokens);

  if (program.find((d) => d.ast === Ast.disc.ContractDefinition) === undefined) {
    throw new NoContractFoundError();
  }

  // Semantic analysis
  const annotations = check(source, program);

  // abi + bytecode generation
  return compile(source, program, annotations);
};

export { Ast } from "./types/ast";
export { Token } from "./types/token";
export { tokenize, parse, check, compile };
