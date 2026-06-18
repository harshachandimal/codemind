import { JavaReturnStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';

export function executeReturnStatement(stmt: JavaReturnStatement, env: JavaEnvironment) {
  if (stmt.expression) {
    env.returnedValue = evaluateJavaExpression({ expression: stmt.expression, variables: env.variables, onArrayRead: env.onArrayRead, onMethodCall: env.onMethodCall });
  } else {
    env.returnedValue = null;
  }
  env.hasReturned = true;
  const entryFunction = env.callStack[env.callStack.length - 1] || 'method';
  env.addStep('return', 'Returned from ' + entryFunction, stmt.line);
}
