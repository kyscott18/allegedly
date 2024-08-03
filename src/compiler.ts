import type {
  Abi,
  AbiError,
  AbiEvent,
  AbiFunction,
  AbiType,
  SolidityBytes,
  SolidityInt,
} from "abitype";
import { NotImplementedError } from "./errors/notImplemented";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import type { Hex, Mutable } from "./types/utils";
import { never } from "./utils/never";

type CompileAbiContext = {
  // TODO(kyle) symbol table
};

export type Contract = { name: string; abi: Abi };

/**
 * Compiles a solidity program into the application-byte-interface.
 */
export const compileAbi = (program: Ast.Program): Contract => {
  const context: CompileAbiContext = {};
  const abi: Mutable<Abi> = [];

  for (const defintion of program) {
    switch (defintion.ast) {
      case Ast.AstType.FunctionDefinition:
        abi.push(compileFunctionAbi(context, defintion));
        break;

      case Ast.AstType.ContractDefinition: {
        const contract = compileContractAbi(context, defintion);
        return contract as Contract;
      }

      case Ast.AstType.EventDefinition:
        abi.push(compileEventAbi(context, defintion));
        break;

      case Ast.AstType.ErrorDefinition:
        abi.push(compileErrorAbi(context, defintion));
        break;

      case Ast.AstType.StructDefinition:
      case Ast.AstType.ModifierDefinition:
        throw new NotImplementedError({ source: JSON.stringify(defintion, null, 2) });

      default:
        never(defintion);
    }
  }

  throw new Error("no contract found");
};

const elementaryTypeToAbi = (type: Ast.ElementaryType): AbiType => {
  switch (type.type.token) {
    case Token.TokenType.Address:
      return "address";

    case Token.TokenType.String:
      return "string";

    case Token.TokenType.Uint:
      return `uint${type.type.size}` as SolidityInt;

    case Token.TokenType.Int:
      return `int${type.type.size}` as SolidityInt;

    case Token.TokenType.Byte:
      return `bytes${type.type.size}` as SolidityBytes;

    case Token.TokenType.Bytes:
      throw "unreachable";

    case Token.TokenType.Bool:
      return "bool";

    default:
      never(type.type);
      throw "unreachable";
  }
};

const compileFunctionAbi = (
  context: CompileAbiContext,
  node: Ast.FunctionDefinition,
): AbiFunction => {};

const compileContractAbi = (
  context: CompileAbiContext,
  node: Ast.ContractDefinition,
): { name: string; abi: Mutable<Abi> } => {
  const name = node.name.value;
  const abi: Mutable<Abi> = [];

  for (const _node of node.nodes) {
    switch (_node.ast) {
      case Ast.AstType.FunctionDefinition:
        abi.push(compileFunctionAbi(context, _node));
        break;

      case Ast.AstType.VariableDefinition:
        abi.push(compileVariableAbi(context, _node));
        break;

      case Ast.AstType.EventDefinition:
        abi.push(compileEventAbi(context, _node));
        break;

      case Ast.AstType.ErrorDefinition:
        abi.push(compileErrorAbi(context, _node));
        break;

      case Ast.AstType.StructDefinition:
      case Ast.AstType.ModifierDefinition:
        throw new NotImplementedError({ source: JSON.stringify(_node, null, 2) });

      default:
        never(_node);
    }
  }

  return { name, abi };
};

const compileVariableAbi = (
  _context: CompileAbiContext,
  node: Ast.VariableDefintion,
): AbiFunction => {
  return {
    type: "function",
    inputs: [],
    name: node.identifier.value,
    outputs: [
      {
        type: elementaryTypeToAbi(node.type),
      },
    ],
    stateMutability: "view",
  };
};

const compileEventAbi = (context: CompileAbiContext, node: Ast.EventDefinition): AbiEvent => {
  return {
    type: "event",
    inputs: [],
    name: node.name.value,
  };
};

const compileErrorAbi = (context: CompileAbiContext, node: Ast.ErrorDefinition): AbiError => {};

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
