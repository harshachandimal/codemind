import { describe, it, expect } from 'vitest';
import { assertJavaBooleanCondition } from '../utils/javaCondition';
import { TraceInterpreterError } from '../errors/javaErrors';

describe('javaCondition', () => {
  it('accepts true boolean', () => {
    expect(assertJavaBooleanCondition(true)).toBe(true);
  });

  it('accepts false boolean', () => {
    expect(assertJavaBooleanCondition(false)).toBe(false);
  });

  it('rejects number', () => {
    expect(() => assertJavaBooleanCondition(1))
      .toThrowError(TraceInterpreterError);
  });

  it('rejects string', () => {
    expect(() => assertJavaBooleanCondition('true'))
      .toThrowError(TraceInterpreterError);
  });

  it('rejects null', () => {
    expect(() => assertJavaBooleanCondition(null))
      .toThrowError(TraceInterpreterError);
  });
});
