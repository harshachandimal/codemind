import { JavaIncrementStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { TraceInterpreterError } from '../errors/javaErrors';

export function executeIncrement(stmt: JavaIncrementStatement, env: JavaEnvironment) {
  if (!env.variables.has(stmt.name)) {
    throw new TraceInterpreterError('JAVA_VARIABLE_NOT_FOUND: ' + stmt.name + ' is not defined');
  }

  const currentVal = env.variables.get(stmt.name);
  if (typeof currentVal !== 'number') {
    throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Increment/decrement requires a numeric variable');
  }

  const result = stmt.operator === '++' ? currentVal + 1 : currentVal - 1;

  env.variables.set(stmt.name, result);
  env.varStore[stmt.name] = result;
  env.addStep('assignment', 'Assigned to variable ' + stmt.name, stmt.line);
}
