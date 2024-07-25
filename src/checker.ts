import { TypeError } from "./errors/type";
import { Ast } from "./types/ast";

export type CheckContext = {
  symbols: Map<string, Ast.Type | Ast.Definition>[];
};

export const check = (program: Ast.Program): void => {
  const context: CheckContext = { symbols: [new Map()] };

  for (const definition of program) {
    checkDefinition(definition, context);
    // context.symbols[0]!.set(definition.name!.token.value, definition);
  }
};

export const checkDefinition = (definition: Ast.Definition, context: CheckContext): void => {
  switch (definition.ast) {
    case Ast.AstType.FunctionDefinition:
      checkStatement(definition.body, context);
      break;
  }
};

export const checkStatement = (statement: Ast.Statement, context: CheckContext): void => {
  switch (statement.ast) {
    case Ast.AstType.ExpressionStatement:
      checkExpression(statement.expression, context);
      break;
    case Ast.AstType.BlockStatement:
      for (const _statement of statement.statements) {
        checkStatement(_statement, context);
      }
      break;
  }
};

export const checkExpression = (expression: Ast.Expression, context: CheckContext): void => {
  switch (expression.ast) {
    case Ast.AstType.Literal:
      break;
    case Ast.AstType.UnaryOperation:
      checkExpression(expression.expression, context);
      break;
    case Ast.AstType.BinaryOperation:
      checkExpression(expression.left, context);
      checkExpression(expression.right, context);

      throw new TypeError("", 2271);
  }
};
