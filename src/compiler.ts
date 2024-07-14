import type { Abi } from "abitype";
import { Ast } from "./types/ast";
import type { Hex, Mutable } from "./types/utils";

type Contract = { name: string; abi: Abi };

export const compileAbi = (program: Ast.Program): (Abi | Contract)[] => {
  const abi: Mutable<Abi> = [];
  for (const defintion of program) {
    switch (defintion.ast) {
      case Ast.AstType.EventDefinition:
        abi.push({
          type: "event",
          inputs: [],
          name: defintion.name.token.value,
        });
        break;
    }
  }
};

type Context = {
  code: Hex;
  /** Memory location for identifiers */
  identifierLocation: Map<string, string>;
};

/**
 * Compiles a valid Solidity program represented by an abstract
 * syntax tree into EVM bytecode.
 */
export const compileCode = (program: Ast.Program): Hex => {
  const context = {
    code: "0x",
    identifierLocation: new Map<string, string>(),
  } as const;

  for (const statement of program) {
    if (statement.type === "expressionStatement") {
      if (statement.expression.type === "identifier") {
        compileIdentifier(context, statement.expression);
      }
    }
  }

  return context.code;
};

const compileIdentifier = (context: Context, identifier: Ast.Identifier) => {
  // PUSH32 memory location [location]
  const location = context.identifierLocation.get(identifier.token.lexeme)!;

  // PUSH32 [location]: [location]
  context.code += `7f${location}`;

  // MLOAD            : [value]
  context.code += "51";
};
