import type {
  AbiError,
  AbiEvent,
  AbiFunction,
  AbiParameter,
  AbiStateMutability,
  AbiType,
  SolidityBytes,
  SolidityInt,
} from "abitype";
import { InvariantViolationError } from "../errors/invariantViolation";
import { Ast } from "../types/ast";
import { Token } from "../types/token";

export const getAbiFunction = (
  node: Ast.FunctionDefinition | Ast.VariableDefintion,
): AbiFunction => {
  if (node.ast === Ast.disc.VariableDefinition) {
    if (node.type.ast === Ast.disc.ElementaryType) {
      return {
        type: "function",
        name: node.identifier.value,
        inputs: [],
        outputs: [{ name: node.identifier.value, type: abiElementaryType(node.type) }],
        stateMutability: "view",
      };
    }

    throw new InvariantViolationError();
  }

  return {
    type: "function",
    name: node.name!.value,
    inputs: node.parameters.map(abiParameter),
    outputs: node.returns.map(abiParameter),
    stateMutability: abiMutability(node.mutability),
  };
};

export const getAbiEvent = (node: Ast.EventDefinition): AbiEvent => {
  return {
    type: "event",
    name: node.name.value,
    inputs: node.parameters.map(abiParameter),
  };
};

export const getAbiError = (node: Ast.ErrorDefinition): AbiError => {
  return {
    type: "error",
    name: node.name.value,
    inputs: node.parameters.map(abiParameter),
  };
};

const abiElementaryType = (type: Ast.ElementaryType): AbiType => {
  switch (type.type.token) {
    case Token.disc.Address:
      return "address";

    case Token.disc.String:
      return "string";

    case Token.disc.Uint:
      return `uint${type.type.size}` as SolidityInt;

    case Token.disc.Int:
      return `int${type.type.size}` as SolidityInt;

    case Token.disc.Byte:
      return `bytes${type.type.size}` as SolidityBytes;

    case Token.disc.Bytes:
      return "bytes";

    case Token.disc.Bool:
      return "bool";
  }
};

const abiParameter = (node: Ast.Parameter): AbiParameter => {
  return {
    name: node.identifier ? node.identifier.value : undefined,
    type: abiElementaryType(node.type as Ast.ElementaryType),
  };
};

const abiMutability = (node: Ast.Mutability | undefined): AbiStateMutability => {
  if (node === undefined) return "nonpayable";

  switch (node.token) {
    case Token.disc.View:
      return "view";

    case Token.disc.Pure:
      return "pure";

    case Token.disc.Nonpayable:
      return "nonpayable";

    case Token.disc.Payable:
      return "payable";
  }
};
