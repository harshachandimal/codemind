import { RuntimeValue } from '../../types/interpreter';
import { TRACE_LIMITS } from '../../config/traceLimits';
import { TraceInterpreterError } from '../errors/javaErrors';

export type JavaArrayElementType = 'int' | 'double' | 'boolean' | 'String' | 'array';

export type JavaArrayValue = {
  type: 'array';
  elementType: JavaArrayElementType;
  value: JavaRuntimeValue[];
};

export type JavaRuntimeValue = number | string | boolean | null | JavaArrayValue;

export function javaValueToRuntimeValue(val: JavaRuntimeValue): RuntimeValue {
  if (val && typeof val === 'object' && val.type === 'array') {
    return val.value.map(javaValueToRuntimeValue);
  }
  return val as RuntimeValue;
}

export function assertNumberValue(val: JavaRuntimeValue): number {
  if (typeof val !== 'number') throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected number');
  return val;
}

export function assertStringValue(val: JavaRuntimeValue): string {
  if (typeof val !== 'string') throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected string');
  return val;
}

export function assertBooleanValue(val: JavaRuntimeValue): boolean {
  if (typeof val !== 'boolean') throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected boolean');
  return val;
}

export function createJavaArrayValue(elementType: JavaArrayElementType, items: JavaRuntimeValue[]): JavaArrayValue {
  if (items.length > TRACE_LIMITS.maxArrayLength) {
    throw new TraceInterpreterError('JAVA_RUNTIME_LIMIT_EXCEEDED: Array length exceeds maximum allowed');
  }
  return {
    type: 'array',
    elementType,
    value: items
  };
}
