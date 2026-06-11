import type { RuntimeValue } from '../../types/interpreter.js';

export function formatRuntimeValue(value: RuntimeValue): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return '[...]';
  return String(value);
}
