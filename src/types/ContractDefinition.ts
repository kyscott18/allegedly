import type { TODO } from "./utils";

export type ContractDefinition = {
  nodeType: "ContractDefinition";
  contractKind: "contract" | "interface" | "library";

  id: number;

  nodes: TODO[];

  src: string;

  usedErrors: number[];
  usedEvents: number[];

  fullyImplemented: boolean;

  contractDependencies: number[];

  internalFunctionIds?: {
    [key: string]: number | undefined;
  };

  scope: number;

  name: string;
  nameLocation: string | undefined;
  canonicalName: string | undefined;

  // Not implemented:
  // abstract
  // baseContracts
  // linearizedBaseContracts
};
