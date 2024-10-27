import { InvariantViolationError } from "../errors/invariantViolation";
import { Ast } from "./ast";
import { Token } from "./token";

export namespace Type {
  export enum disc {
    Literal,
    Elementary,
    Function,
    Contract,
    Struct,
    Tuple,
  }

  export type Literal = {
    type: disc.Literal;
    value: Omit<Ast.Literal["token"], "loc">;
  };

  export type Elementary<value = Ast.ElementaryType["type"]> = {
    type: disc.Elementary;
    value: value extends value ? Omit<value, "loc"> : never;
  };

  export type Function = {
    type: disc.Function;
    parameters: Type[];
    returns: Type[];
    isTypeConversion: boolean;
  };

  export type Contract = {
    type: disc.Contract;
    functions: Map<string, Function[]>;
  };

  export type Struct = {
    type: disc.Struct;
    members: Map<string, Type>;
  };

  export type Tuple = {
    type: disc.Tuple;
    elements: (Type | undefined)[];
  };

  /** Convert `Ast.Type | Ast.ContractDefinition` to `Type.Type` */
  export const convertAst = (ast: Ast.Type | Ast.ContractDefinition): Type => {
    if (ast.ast === Ast.disc.ElementaryType) {
      return { type: disc.Elementary, value: ast.type };
    }

    if (ast.ast === Ast.disc.ContractDefinition) {
      const functions = new Map<string, Function[]>();

      for (const node of ast.nodes) {
        if (node.ast === Ast.disc.FunctionDefinition) {
          if (functions.has(node.name!.value) === false) {
            functions.set(node.name!.value, []);
          }

          functions.get(node.name!.value)!.push({
            type: disc.Function,
            parameters: node.parameters.map((param) => convertAst(param.type)),
            returns: node.returns.map((ret) => convertAst(ret.type)),
            isTypeConversion: false,
          });
        }
      }

      return { type: disc.Contract, functions };
    }

    throw new Error("bad");
  };

  /** Try to unwrap `Tuple` into it's underlying type */
  export const unwrap = (type: Tuple): Type => {
    if (type.elements.length === 1) return type.elements[0]!;
    return type;
  };

  export const staticAddress = {
    type: disc.Elementary,
    value: { token: Token.disc.Address },
  } satisfies Elementary;

  export const staticString = {
    type: disc.Elementary,
    value: { token: Token.disc.String },
  } satisfies Elementary;

  export const staticBytes = {
    type: disc.Elementary,
    value: { token: Token.disc.Bytes },
  } satisfies Elementary;

  export const staticBool = {
    type: disc.Elementary,
    value: { token: Token.disc.Bool },
  } satisfies Elementary;

  export const staticUintSize = (size: number) =>
    ({
      type: disc.Elementary,
      value: { token: Token.disc.Uint, size },
    }) satisfies Elementary;

  export const staticIntSize = (size: number) =>
    ({
      type: disc.Elementary,
      value: { token: Token.disc.Int, size },
    }) satisfies Elementary;

  export const staticBytesSize = (size: number) =>
    ({
      type: disc.Elementary,
      value: { token: Token.disc.Byte, size },
    }) satisfies Elementary;

  export const conversion = (type: Elementary): Function => {
    return {
      type: disc.Function,
      parameters: [type],
      returns: [type],
      isTypeConversion: true,
    };
  };

  export const toString = (type: Type): string => {
    switch (type.type) {
      case disc.Literal:
        return type.value.value;
      case disc.Elementary:
        switch (type.value.token) {
          case Token.disc.Address:
            return "address";
          case Token.disc.String:
            return "string";
          case Token.disc.Uint:
            return `uint${type.value.size}`;
          case Token.disc.Int:
            return `int${type.value.size}`;
          case Token.disc.Byte:
            return `bytes${type.value.size}`;
          case Token.disc.Bytes:
            return "bytes";
          case Token.disc.Bool:
            return "bool";
        }
        throw new InvariantViolationError();

      case disc.Function:
        return "function";

      case disc.Contract:
        return "contract";

      case disc.Struct:
        return "struct";

      case disc.Tuple:
        return `(${type.elements.map((t) => (t ? toString(t) : "")).join(", ")})`;
    }
  };

  export type Type = Literal | Elementary | Function | Contract | Struct | Tuple;
}
