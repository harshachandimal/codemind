import { JavaAugmentedAssignmentStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';
import { TraceInterpreterError } from '../errors/javaErrors';

export function executeAugmentedAssignment(stmt: JavaAugmentedAssignmentStatement, env: JavaEnvironment) {
  if (!env.variables.has(stmt.name)) {
    throw new TraceInterpreterError('JAVA_VARIABLE_NOT_FOUND: ' + stmt.name + ' is not defined');
  }

  const currentVal = env.variables.get(stmt.name);
  if (typeof currentVal !== 'number') {
    throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Augmented assignment requires a numeric variable');
  }

  const rightVal = evaluateJavaExpression({ expression: stmt.expression, variables: env.variables, onArrayRead: env.onArrayRead, onMethodCall: env.onMethodCall });
  if (typeof rightVal !== 'number') {
    throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Augmented assignment requires a numeric right side');
  }

  let result: number;
  if (stmt.operator === '+=') result = currentVal + rightVal;
  else if (stmt.operator === '-=') result = currentVal - rightVal;
  else if (stmt.operator === '*=') result = currentVal * rightVal;
  else if (stmt.operator === '/=') result = currentVal / rightVal;
  else if (stmt.operator === '%=') result = currentVal % rightVal;
  else throw new TraceInterpreterError('JAVA_UNSUPPORTED_STATEMENT: Unsupported operator');

  if (!Number.isInteger(result) && Number.isInteger(currentVal)) {
      result = Math.trunc(result);
  }

  env.variables.set(stmt.name, result);
  env.varStore[stmt.name] = result;
  env.addStep('assignment', 'Assigned to variable ' + stmt.name);
}
