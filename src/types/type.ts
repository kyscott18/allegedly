import { Ast } from "./ast";
import { Token } from "./token";

export namespace Type {
  export enum disc {
    Elementary,
    Function,
    Contract,
    Struct,
    Tuple,
  }

  export type Elementary<value = Ast.ElementaryType["type"]> = {
    type: disc.Elementary;
    value: value extends value ? Omit<value, "loc"> : never;
    isLiteral: boolean;
  };

  export type Function = {
    type: disc.Function;
    parameters: Type[];
    returns: Type[];
    isTypeConversion: boolean;
  };

  export type Contract = {
    type: disc.Contract;
    functions: [string, Function][];
  };

  export type Struct = {
    type: disc.Struct;
    members: Map<string, Type>;
  };

  export type Tuple = {
    type: disc.Tuple;
    elements: Type[];
  };

  /** Convert `Ast.Type | Ast.ContractDefinition` to `Type.Type` */
  export const convertAst = (ast: Ast.Type | Ast.ContractDefinition): Type => {
    if (ast.ast === Ast.disc.ElementaryType) {
      return { type: disc.Elementary, value: ast.type, isLiteral: false };
    }

    if (ast.ast === Ast.disc.ContractDefinition) {
      return {
        type: disc.Contract,
        functions: ast.nodes
          .filter(
            (node): node is Ast.FunctionDefinition => node.ast === Ast.disc.FunctionDefinition,
          )
          .map((node) => [
            node.name!.value,
            {
              type: disc.Function,
              parameters: node.parameters.map((param) => convertAst(param.type)),
              returns: node.returns.map((ret) => convertAst(ret.type)),
              isTypeConversion: false,
            },
          ]),
      };
    }

    throw new Error("bad");
  };

  /** Try to unwrap `Tuple` into it's underlying type */
  export const unwrap = (type: Tuple): Type => {
    if (type.elements.length === 1) return type.elements[0]!;
    return type;
  };

  export const staticUint256 = {
    type: disc.Elementary,
    value: { token: Token.disc.Uint, size: 256 },
    isLiteral: false,
  } satisfies Elementary;

  export const staticAddress = {
    type: disc.Elementary,
    value: { token: Token.disc.Address },
    isLiteral: false,
  } satisfies Elementary;

  export const staticBytes = {
    type: disc.Elementary,
    value: { token: Token.disc.Bytes },
    isLiteral: false,
  } satisfies Elementary;

  export const staticBytes4 = {
    type: disc.Elementary,
    value: { token: Token.disc.Byte, size: 4 },
    isLiteral: false,
  } satisfies Elementary;

  export type Type = Elementary | Function | Contract | Struct | Tuple;
}