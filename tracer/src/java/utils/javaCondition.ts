import { RuntimeValue } from '../../types/interpreter';
import { TraceInterpreterError } from '../errors/javaErrors';

export function assertJavaBooleanCondition(value: RuntimeValue): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Java if condition must evaluate to boolean.');
}
