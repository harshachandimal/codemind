import { JavaVariableDeclarationStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';
import { TraceInterpreterError } from '../errors/javaErrors';
import { RuntimeValue } from '../../types/interpreter';
import { javaValueToRuntimeValue } from '../runtime/javaRuntimeValues';

export function executeVariableDeclaration(stmt: JavaVariableDeclarationStatement, env: JavaEnvironment) {
  let val: RuntimeValue = null;
  if (stmt.expression !== null) {
    val = evaluateJavaExpression({ expression: stmt.expression, variables: env.variables, onArrayRead: env.onArrayRead, onMethodCall: env.onMethodCall });
  }
  
  if (val !== null) {
    if (stmt.typeName === 'int' && (typeof val !== 'number' || !Number.isInteger(val))) {
       throw new TraceInterpreterError('JAVA_TYPE_MISMATCH: Cannot assign to int');
    } else if (stmt.typeName === 'double' && typeof val !== 'number') {
       throw new TraceInterpreterError('JAVA_TYPE_MISMATCH: Cannot assign to double');
    } else if (stmt.typeName === 'boolean' && typeof val !== 'boolean') {
       throw new TraceInterpreterError('JAVA_TYPE_MISMATCH: Cannot assign to boolean');
    } else if (stmt.typeName === 'String' && typeof val !== 'string') {
       throw new TraceInterpreterError('JAVA_TYPE_MISMATCH: Cannot assign to String');
    } else if (stmt.typeName.endsWith('[]')) {
       if (typeof val !== 'object' || (val as any).type !== 'array') {
          throw new TraceInterpreterError('JAVA_TYPE_MISMATCH: Cannot assign non-array to array variable');
       }
    }
  }

  env.variables.set(stmt.name, val);
  env.varStore[stmt.name] = javaValueToRuntimeValue(val as any);
  env.addStep('variable_declaration', 'Declared variable ' + stmt.name);
}
