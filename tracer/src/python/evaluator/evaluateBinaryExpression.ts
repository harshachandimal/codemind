import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { createPythonError } from '../errors/createPythonError';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';

export function evaluateBinaryOperation(
  left: PythonRuntimeValue,
  op: string,
  right: PythonRuntimeValue
): PythonRuntimeValue {
  if (['<', '<=', '>', '>=', '==', '!='].includes(op)) {
    if (op === '==') return left === right;
    if (op === '!=') return left !== right;
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw createPythonError(`Unsupported type for operator ${op}`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
    }
    if (op === '<') return left < right;
    if (op === '<=') return left <= right;
    if (op === '>') return left > right;
    if (op === '>=') return left >= right;
  }

  if (op === '+') {
    if (typeof left === 'number' && typeof right === 'number') return left + right;
    if (typeof left === 'string' && typeof right === 'string') return left + right;
    throw createPythonError(`Unsupported type for operator +`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
  }

  if (op === '-') {
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    throw createPythonError(`Unsupported type for operator -`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
  }

  if (['*', '/', '//', '%'].includes(op)) {
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw createPythonError(`Unsupported type for operator ${op}`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
    }
    if (op === '*') return left * right;
    if (op === '/') return left / right;
    if (op === '//') return Math.floor(left / right);
    if (op === '%') return left % right;
  }

  throw createPythonError(`Unknown operator ${op}`, PYTHON_ERROR_CODES.UNSUPPORTED_EXPRESSION);
}
