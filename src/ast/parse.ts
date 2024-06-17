import { NotImplementedError } from "../errors/notImplemented";
import type { ContractDefinition } from "../types/ContractDefinition";
import type { TODO } from "../types/utils";
import { createCursor } from "../utils/cursor";

export const parse = (source: string) => {
  const cursor = createCursor(source);

  const astTree: TODO = [];

  while (true) {
    const token = cursor.readToken();

    if (token === undefined) return astTree;

    if (token === "contract") {
      // contract definition

      astTree.push({
        nodeType: "ContractDefinition",
        contractKind: "contract",
      } satisfies ContractDefinition);
    } else if (token === "interface") {
      // contract definition

      throw new NotImplementedError({ source: "interface" });
    } else if (token === "library") {
      // contract definition

      throw new NotImplementedError({ source: "library" });
    }
  }
};
