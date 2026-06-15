import { describe, it, expect } from 'vitest';
import { parseJavaSource } from '../ast/parseJavaSource';
import { TRACE_LIMITS } from '../../config/traceLimits';

describe('javaAstParser', () => {
  it('A) parses_simple_class_and_static_method', () => {
    const source = `
      public class Main {
        public static int add(int a, int b) {
          return a + b;
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.language).toBe('java');
    expect(result.hasSyntaxError).toBe(false);
    expect(result.classNames).toContain('Main');
    expect(result.staticMethodNames).toContain('add');
    expect(result.detectedStructures).toContain('return');
  });

  it('B) parses_if_else_method', () => {
    const source = `
      public class Main {
        public static String check(int n) {
          if (n > 0) {
            return "positive";
          } else {
            return "zero_or_negative";
          }
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.staticMethodNames).toContain('check');
    expect(result.detectedStructures).toContain('if');
    expect(result.detectedStructures).toContain('else');
    expect(result.detectedStructures).toContain('return');
  });

  it('C) parses_for_loop_method', () => {
    const source = `
      public class Main {
        public static int total(int n) {
          int result = 0;
          for (int i = 0; i < n; i++) {
            result += i;
          }
          return result;
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.staticMethodNames).toContain('total');
    expect(result.detectedStructures).toContain('for');
    expect(result.detectedStructures).toContain('variable_declaration');
    expect(result.detectedStructures).toContain('assignment');
  });

  it('D) parses_while_loop_method', () => {
    const source = `
      public class Main {
        public static int totalWhile(int n) {
          int i = 0;
          int result = 0;
          while (i < n) {
            result += i;
            i++;
          }
          return result;
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.detectedStructures).toContain('while');
  });

  it('E) parses_nested_loop_method', () => {
    const source = `
      public class Main {
        public static int countPairs(int n) {
          int count = 0;
          for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
              count++;
            }
          }
          return count;
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.staticMethodNames).toContain('countPairs');
    expect(result.detectedStructures).toContain('for');
    expect(result.hasSyntaxError).toBe(false);
  });

  it('F) parses_recursion_candidate', () => {
    const source = `
      public class Main {
        public static int factorial(int n) {
          if (n <= 1) {
            return 1;
          }
          return n * factorial(n - 1);
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.staticMethodNames).toContain('factorial');
    expect(result.detectedStructures).toContain('recursion_candidate');
  });

  it('G) detects_unbalanced_brace', () => {
    const source = `
      public class Main {
        public static int add(int a, int b) {
          return a + b;
        // missing closing brace
    `;
    const result = parseJavaSource(source);
    expect(result.hasSyntaxError).toBe(true);
    expect(result.braceBalanced).toBe(false);
  });

  it('H) detects_unbalanced_parentheses', () => {
    const source = `
      public class Main {
        public static int add(int a, int b {
          return a + b;
        }
      }
    `;
    const result = parseJavaSource(source);
    expect(result.hasSyntaxError).toBe(true);
    expect(result.parenthesisBalanced).toBe(false);
  });

  it('I) detects_no_class', () => {
    const source = `
      public static int add(int a, int b) {
        return a + b;
      }
    `;
    const result = parseJavaSource(source);
    expect(result.hasSyntaxError).toBe(true);
    expect(result.classNames.length).toBe(0);
  });

  it('J) detects_no_static_method', () => {
    const source = `
      public class Main {
      }
    `;
    const result = parseJavaSource(source);
    expect(result.hasSyntaxError).toBe(true);
    expect(result.staticMethodNames.length).toBe(0);
  });

  it('K) strips_comments_safely', () => {
    const source = `
      public class Main {
        public static int add(int a, int b) {
          return a + b;
        }
      }
      // fake class FakeClass {
      /* public static int fakeMethod() { } */
    `;
    const result = parseJavaSource(source);
    expect(result.classNames).toContain('Main');
    expect(result.classNames).not.toContain('FakeClass');
    expect(result.staticMethodNames).toContain('add');
    expect(result.staticMethodNames).not.toContain('fakeMethod');
  });

  it('L) does_not_return_raw_source', () => {
    const source = `
      public class Main {
        public static int add(int a, int b) { return a + b; }
      }
    `;
    const result = parseJavaSource(source) as any;
    expect(result.sourceCode).toBeUndefined();
  });

  it('M) rejects_too_large_source', () => {
    const largeSource = 'a'.repeat(TRACE_LIMITS.maxSourceLength + 1);
    expect(() => parseJavaSource(largeSource)).toThrow('Source code exceeds maximum length allowed.');
    // Check error message doesn't contain the raw source
    try {
      parseJavaSource(largeSource);
    } catch (error: any) {
      expect(error.message).not.toContain('a'.repeat(100));
    }
  });
});
