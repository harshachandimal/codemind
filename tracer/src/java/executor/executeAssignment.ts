import { JavaAssignmentStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';
import { TraceInterpreterError } from '../errors/javaErrors';

export function executeAssignment(stmt: JavaAssignmentStatement, env: JavaEnvironment) {
  if (!env.variables.has(stmt.name)) {
    throw new TraceInterpreterError('JAVA_VARIABLE_NOT_FOUND: ' + stmt.name + ' is not defined');
  }
  const val = evaluateJavaExpression({ expression: stmt.expression, variables: env.variables, onArrayRead: env.onArrayRead, onMethodCall: env.onMethodCall });
  const currentVal = env.variables.get(stmt.name);
  if (currentVal !== null && typeof currentVal !== typeof val) {
    throw new TraceInterpreterError('JAVA_TYPE_MISMATCH: Cannot assign ' + typeof val + ' to variable originally holding ' + typeof currentVal);
  }
  env.variables.set(stmt.name, val);
  env.varStore[stmt.name] = val;
  env.addStep('assignment', 'Assigned to variable ' + stmt.name);
}
