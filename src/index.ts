import type { Abi } from "abitype";
import { check } from "./checker";
import { compileAbi, compileCode } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";
import type { Hex } from "./types/utils";

export type SolReturnType<source extends string> = {
  code: Hex;
  abi: Abi;
};

/**
 * Compiles Solidity source code to EVM bytecode.
 *
 * @param source Source code of a Solidity program.
 */
export const sol = <const source extends string>(source: source): SolReturnType<source> => {
  // Lexical analysis
  const tokens = tokenize(source);

  // Syntax analysis
  const program = parse(tokens);

  // Semantic analysis
  check(program);

  // abi generation
  const abi = compileAbi(program);

  // Bytecode generation
  const code = compileCode(program);

  return { code, abi };
};
