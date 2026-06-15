import { RuntimeValue } from '../../types/interpreter';

export function isJavaTruthy(value: RuntimeValue): boolean {
  if (typeof value === 'boolean') return value;
  return false;
}
