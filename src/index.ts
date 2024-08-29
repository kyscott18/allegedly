import type { Abi } from "abitype";
import { compileAbi } from "./abiCompiler";
import { check } from "./checker";
import { compile } from "./compiler";
import { tokenize } from "./lexer";
import { parse } from "./parser";
import type { Hex } from "./types/utils";

export type SolReturnType<source extends string> = {
  name: string;
  abi: Abi;
  code: Hex;
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
  const annotations = check(program);

  // abi generation
  const { name, abi } = compileAbi(program);

  // Bytecode generation
  const code = compile(program, annotations);

  return { name, abi, code };
};

export { Ast } from "./types/ast";
export { Token } from "./types/token";
export { tokenize, parse, check, compileAbi, compile };
