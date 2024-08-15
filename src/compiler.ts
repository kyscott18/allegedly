import { concat, numberToHex, toHex } from "viem";
import { NotImplementedError } from "./errors/notImplemented";
import { Ast } from "./types/ast";
import { Token } from "./types/token";
import type { Hex } from "./types/utils";
import { Code, pad, push } from "./utils/code";
import { never } from "./utils/never";

export type CompileBytecodeContext = {
  symbols: Map<
    string,
    {
      /** Memory location for identifiers */
      location: Hex;
    }
  >[];
  functionSelectors: Map<Hex, Hex>;
  freeMemoryPointer: number;
};

/**
 * Compiles a valid Solidity program represented by an abstract
 * syntax tree into EVM bytecode.
 */
export const compile = (program: Ast.Program): Hex => {
  const context: CompileBytecodeContext = {
    symbols: [new Map()],
    functionSelectors: new Map(),
    freeMemoryPointer: 0x80,
  };

  for (const defintion of program) {
    switch (defintion.ast) {
      case Ast.AstType.FunctionDefinition:
        compileFunction(context, defintion);
        break;

      case Ast.AstType.ContractDefinition:
        return compileContract(context, defintion);

      case Ast.AstType.EventDefinition:
      case Ast.AstType.ErrorDefinition:
      case Ast.AstType.StructDefinition:
      case Ast.AstType.ModifierDefinition:
        break;

      default:
        never(defintion);
    }
  }
  throw "unreachable";
};

const enterScope = (context: CompileBytecodeContext) => {
  context.symbols.push(new Map());
};

const exitScope = (context: CompileBytecodeContext) => {
  context.symbols.pop();
};

const addSymbol = (context: CompileBytecodeContext, symbol: string): Hex => {
  const scope = context.symbols[context.symbols.length - 1]!;
  const location = numberToHex(context.freeMemoryPointer);

  scope.set(symbol, { location: numberToHex(context.freeMemoryPointer) });
  context.freeMemoryPointer += 0x20;

  return location;
};

const resolveSymbol = (context: CompileBytecodeContext, symbol: string): Hex => {
  for (let i = context.symbols.length - 1; i >= 0; i--) {
    const scope = context.symbols[i];
    if (scope?.has(symbol)) return scope.get(symbol)!.location;
  }

  throw "unreachable";
};

const compileContract = (context: CompileBytecodeContext, node: Ast.ContractDefinition): Hex => {
  for (const _node of node.nodes) {
    switch (_node.ast) {
      case Ast.AstType.FunctionDefinition:
        compileFunction(context, _node);
        break;

      case Ast.AstType.VariableDefinition:
      case Ast.AstType.EventDefinition:
      case Ast.AstType.ErrorDefinition:
      case Ast.AstType.StructDefinition:
      case Ast.AstType.ModifierDefinition:
        throw new NotImplementedError({ source: JSON.stringify(_node, null, 2) });

      default:
        never(_node);
    }
  }

  return context.functionSelectors.get("0x00")!;
};

const compileFunction = (context: CompileBytecodeContext, node: Ast.FunctionDefinition) => {
  enterScope(context);

  let code: Hex = "0x";

  for (const statement of node.body.statements) {
    code = concat([code, compileStatement(context, statement)]);
  }

  if (
    node.visibility.token === Token.TokenType.External ||
    node.visibility.token === Token.TokenType.Public
  ) {
    // compute selector
    // add to context

    context.functionSelectors.set("0x00", code);
  }

  exitScope(context);
};

const compileStatement = (context: CompileBytecodeContext, node: Ast.Statement): Hex => {
  switch (node.ast) {
    case Ast.AstType.VariableDeclaration: {
      const location = addSymbol(context, node.identifier.value);
      if (node.initializer) {
        return concat([compileExpression(context, node.initializer), push(location), Code.MSTORE]);
      }
      return "0x";
    }

    case Ast.AstType.ExpressionStatement:
      return compileExpression(context, node.expression);
  }
};

const compileExpression = (context: CompileBytecodeContext, node: Ast.Expression): Hex => {
  switch (node.ast) {
    case Ast.AstType.Literal: {
      switch (node.token.token) {
        case Token.TokenType.NumberLiteral:
          return push(pad(toHex(node.token.value)));
      }
      break;
    }
    case Ast.AstType.Identifier: {
      return compileIdentifier(context, node);
    }
  }
};

const compileIdentifier = (context: CompileBytecodeContext, identifier: Ast.Identifier): Hex => {
  const location = resolveSymbol(context, identifier.token.value);

  return concat([push(location), Code.MLOAD]);
};
