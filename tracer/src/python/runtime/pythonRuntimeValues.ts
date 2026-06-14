import { RuntimeValue } from '../../types/interpreter';
import { TRACE_LIMITS } from '../../config/traceLimits';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';
import { createPythonError } from '../errors/createPythonError';

export type PythonRuntimeValue = RuntimeValue;

export function assertNumberValue(val: PythonRuntimeValue): number {
  if (typeof val !== 'number') {
    throw new Error(`Expected number, got ${typeof val}`);
  }
  return val;
}

export function assertStringValue(val: PythonRuntimeValue): string {
  if (typeof val !== 'string') {
    throw new Error(`Expected string, got ${typeof val}`);
  }
  return val;
}

export function assertListValue(val: PythonRuntimeValue): PythonRuntimeValue[] {
  if (!Array.isArray(val)) {
    throw createPythonError(`Expected list, got ${typeof val}`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
  }
  return val;
}

export function assertPythonArrayLength(length: number): void {
  if (length > TRACE_LIMITS.maxArrayLength) {
    throw createPythonError(`Array length exceeds maximum of ${TRACE_LIMITS.maxArrayLength}`, PYTHON_ERROR_CODES.UNSUPPORTED_STATEMENT);
  }
}
