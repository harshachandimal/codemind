import { describe, it, expect } from 'vitest';
import { validatePythonSupportedSyntax, assertPythonSupportedSyntax } from '../utils/pythonUnsupportedNodes';

describe('Python Unsupported Syntax Guard', () => {
  it('allows_simple_function', () => {
    const sourceCode = `
def add(a, b):
    return a + b
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations).toHaveLength(0);
  });

  it('allows_if_else', () => {
    const sourceCode = `
def max_value(a, b):
    if a > b:
        return a
    else:
        return b
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations).toHaveLength(0);
  });

  it('allows_for_range_loop', () => {
    const sourceCode = `
def total(n):
    result = 0
    for i in range(n):
        result += i
    return result
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations).toHaveLength(0);
  });

  it('allows_while_loop', () => {
    const sourceCode = `
def count(n):
    i = 0
    while i < n:
        i += 1
    return i
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations).toHaveLength(0);
  });

  it('allows_self_recursion', () => {
    const sourceCode = `
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode, entryFunction: 'factorial' });
    expect(violations).toHaveLength(0);
  });

  it('allows_len_and_range', () => {
    const sourceCode = `
def count(arr):
    for i in range(len(arr)):
        pass
    return len(arr)
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations).toHaveLength(0);
  });

  it('allows_list_literal', () => {
    const sourceCode = `
def make_list():
    arr = [1, 2, 3]
    return arr
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations).toHaveLength(0);
  });

  it('rejects_import', () => {
    const sourceCode = `import os`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_IMPORT_UNSUPPORTED');
  });

  it('rejects_from_import', () => {
    const sourceCode = `from math import sqrt`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_IMPORT_UNSUPPORTED');
  });

  it('rejects_class', () => {
    const sourceCode = `
class Solution:
    pass
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_CLASS_UNSUPPORTED');
  });

  it('rejects_decorator', () => {
    const sourceCode = `
@cache
def fib(n):
    return n
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_DECORATOR_UNSUPPORTED');
  });

  it('rejects_try_except', () => {
    const sourceCode = `
try:
    x = 1
except Exception:
    x = 0
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_EXCEPTION_UNSUPPORTED');
  });

  it('rejects_raise', () => {
    const sourceCode = `raise ValueError("bad")`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_RAISE_UNSUPPORTED');
  });

  it('rejects_with', () => {
    const sourceCode = `
with open("x.txt") as f:
    data = f.read()
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations.map((v) => v.code)).toContain('PYTHON_WITH_UNSUPPORTED');
  });

  it('rejects_async_await', () => {
    const sourceCode = `
async def fetch():
    await something()
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_ASYNC_UNSUPPORTED');
  });

  it('rejects_yield', () => {
    const sourceCode = `yield x`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_YIELD_UNSUPPORTED');
  });

  it('rejects_lambda', () => {
    const sourceCode = `lambda x: x + 1`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_LAMBDA_UNSUPPORTED');
  });

  it('rejects_comprehension', () => {
    const sourceCode = `[x for x in arr]`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_COMPREHENSION_UNSUPPORTED');
  });

  it('rejects_dangerous_builtin', () => {
    const sourceCodes = [
      'open("x.txt")',
      'eval("1+1")',
      'exec("x=1")',
      '__import__("os")',
    ];

    for (const sourceCode of sourceCodes) {
      const violations = validatePythonSupportedSyntax({ sourceCode });
      const codes = violations.map((v) => v.code);
      expect(
        codes.includes('PYTHON_BUILTIN_UNSUPPORTED') || codes.includes('PYTHON_DUNDER_UNSUPPORTED')
      ).toBe(true);
    }
  });

  it('rejects_method_call', () => {
    const sourceCode = `arr.append(1)`;
    const violations = validatePythonSupportedSyntax({ sourceCode });
    expect(violations[0]?.code).toBe('PYTHON_METHOD_CALL_UNSUPPORTED');
  });

  it('rejects_unknown_helper_call', () => {
    const sourceCode = `
def main(n):
    return helper(n)
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode, entryFunction: 'main' });
    expect(violations[0]?.code).toBe('PYTHON_FUNCTION_CALL_UNSUPPORTED');
  });

  it('rejects_mutual_recursion', () => {
    const sourceCode = `
def a(n):
    return b(n)

def b(n):
    return a(n)
    `;
    const violations = validatePythonSupportedSyntax({ sourceCode, entryFunction: 'a' });
    expect(violations.map(v => v.code)).toContain('PYTHON_FUNCTION_CALL_UNSUPPORTED');
  });

  it('assert_throws_safe_error', () => {
    const sourceCode = `import os`;
    try {
      assertPythonSupportedSyntax({ sourceCode });
      throw new Error('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe('PYTHON_UNSUPPORTED_SYNTAX');
      expect(error.message).not.toContain('import os');
    }
  });
});
