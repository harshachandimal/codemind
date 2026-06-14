import { describe, it, expect } from 'vitest';
import { isPythonTruthy } from '../utils/pythonTruthiness';

describe('Python Truthiness', () => {
  it('evaluates truthiness correctly', () => {
    expect(isPythonTruthy(false)).toBe(false);
    expect(isPythonTruthy(true)).toBe(true);
    expect(isPythonTruthy(null)).toBe(false);
    expect(isPythonTruthy(0)).toBe(false);
    expect(isPythonTruthy(1)).toBe(true);
    expect(isPythonTruthy(-1)).toBe(true);
    expect(isPythonTruthy("")).toBe(false);
    expect(isPythonTruthy("hi")).toBe(true);
    expect(isPythonTruthy([])).toBe(false);
    expect(isPythonTruthy([1])).toBe(true);
  });
});
