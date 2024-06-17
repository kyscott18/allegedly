import type { Abi } from "abitype";
import { parse } from "./ast/parse";
import type { Hex, TODO } from "./types/utils";

export type CompileReturnType = {
  bytecode: Hex;
  deployedBytecode: Hex;
  abi: Abi;
  sourceMap: TODO;
  metadata: TODO;
};

/**
 * Compiles Solidity source code to EVM bytecode.
 *
 * @param source Source code of a Solidity program.
 */
export const compile = (source: string): CompileReturnType => {
  // Lexical + syntax analysis
  const ast = parse(source);

  // Semantic analysis
  // todo

  // Abi generation
  // todo

  // Bytecode generation
  // todo
};
