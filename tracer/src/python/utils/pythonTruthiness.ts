import { RuntimeValue } from '../../types/interpreter';

export function isPythonTruthy(value: RuntimeValue): boolean {
  if (typeof value === 'boolean') return value;
  if (value === null) return false;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value !== '';
  if (Array.isArray(value)) return value.length > 0;
  return false;
}
