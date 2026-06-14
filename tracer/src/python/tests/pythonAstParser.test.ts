import { describe, it, expect } from 'vitest';
import { parsePythonSource } from '../ast/parsePythonSource';
import { TRACE_LIMITS } from '../../config/traceLimits';

describe('Python AST Parser Spike', () => {
  it('parses_simple_function', () => {
    const source = `
def add(a, b):
    return a + b
    `;
    const summary = parsePythonSource(source);
    expect(summary.language).toBe('python');
    expect(summary.hasSyntaxError).toBe(false);
    expect(summary.nodeCount).toBeGreaterThan(0);
    expect(summary.topLevelFunctionNames).toContain('add');
  });

  it('parses_if_else', () => {
    const source = `
def max_value(a, b):
    if a > b:
        return a
    else:
        return b
    `;
    const summary = parsePythonSource(source);
    expect(summary.hasSyntaxError).toBe(false);
    expect(summary.topLevelFunctionNames).toContain('max_value');
  });

  it('parses_for_range_loop', () => {
    const source = `
def total(n):
    result = 0
    for i in range(n):
        result += i
    return result
    `;
    const summary = parsePythonSource(source);
    expect(summary.hasSyntaxError).toBe(false);
    expect(summary.topLevelFunctionNames).toContain('total');
  });

  it('parses_while_loop', () => {
    const source = `
def count(n):
    i = 0
    while i < n:
        i += 1
    return i
    `;
    const summary = parsePythonSource(source);
    expect(summary.hasSyntaxError).toBe(false);
    expect(summary.topLevelFunctionNames).toContain('count');
  });

  it('parses_nested_loop', () => {
    const source = `
def count_pairs(n):
    count = 0
    for i in range(n):
        for j in range(n):
            count += 1
    return count
    `;
    const summary = parsePythonSource(source);
    expect(summary.hasSyntaxError).toBe(false);
    expect(summary.topLevelFunctionNames).toContain('count_pairs');
  });

  it('parses_recursion', () => {
    const source = `
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
    `;
    const summary = parsePythonSource(source);
    expect(summary.hasSyntaxError).toBe(false);
    expect(summary.topLevelFunctionNames).toContain('factorial');
  });

  it('detects_invalid_syntax', () => {
    const source = `
def broken(
    return 1
    `;
    const summary = parsePythonSource(source);
    expect(summary.hasSyntaxError).toBe(true);
    expect(summary.nodeCount).toBeGreaterThan(0);
  });

  it('does_not_execute_code', () => {
    const source = `
import os
os.system("echo unsafe")
    `;
    const summary = parsePythonSource(source);
    // Should parse without executing anything
    expect(summary.language).toBe('python');
    expect(summary.hasSyntaxError).toBe(false);
  });

  it('rejects_too_large_source', () => {
    const largeSource = 'a' + ' = 1\n'.repeat(TRACE_LIMITS.maxSourceLength);
    expect(() => parsePythonSource(largeSource)).toThrow(
      `Source code exceeds maximum length of ${TRACE_LIMITS.maxSourceLength} characters.`
    );
  });
});
