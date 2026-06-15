import { describe, it, expect } from 'vitest';
import { validateJavaSupportedSyntax, TraceParseError, assertJavaSupportedSyntax } from '../utils/javaUnsupportedNodes';

describe('javaUnsupportedNodeGuard', () => {
  it('A) allows_simple_static_method', () => {
    const source = `
      public class Main {
        public static int add(int a, int b) {
          return a + b;
        }
      }
    `;
    expect(validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'add' })).toHaveLength(0);
  });

  it('B) allows_if_else', () => {
    const source = `
      public class Main {
        public static String check(int n) {
          if (n > 0) {
            return "positive";
          } else {
            return "zero";
          }
        }
      }
    `;
    expect(validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'check' })).toHaveLength(0);
  });

  it('C) allows_for_loop', () => {
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
    expect(validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'total' })).toHaveLength(0);
  });

  it('D) allows_while_loop', () => {
    const source = `
      public class Main {
        public static int total(int n) {
          int result = 0;
          int i = 0;
          while (i < n) {
            result += i;
            i++;
          }
          return result;
        }
      }
    `;
    expect(validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'total' })).toHaveLength(0);
  });

  it('E) allows_self_recursion', () => {
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
    expect(validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'factorial' })).toHaveLength(0);
  });

  it('F) rejects_import', () => {
    const source = `import java.util.*; public class Main {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_IMPORT_OR_PACKAGE_UNSUPPORTED');
  });

  it('G) rejects_package', () => {
    const source = `package com.example; public class Main {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_IMPORT_OR_PACKAGE_UNSUPPORTED');
  });

  it('H) rejects_annotation', () => {
    const source = `@Override public class Main {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_ANNOTATION_UNSUPPORTED');
  });

  it('I) rejects_extends', () => {
    const source = `public class Main extends Base {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_INHERITANCE_UNSUPPORTED');
  });

  it('J) rejects_interface', () => {
    const source = `public interface Main {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_INTERFACE_UNSUPPORTED');
  });

  it('K) rejects_enum', () => {
    const source = `public enum Main {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_ENUM_UNSUPPORTED');
  });

  it('L) rejects_record', () => {
    const source = `public record Main() {}`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_RECORD_UNSUPPORTED');
  });

  it('M) rejects_new_object', () => {
    const source = `public class Main { public static int a() { return new Object(); } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_OBJECT_CREATION_UNSUPPORTED');
  });

  it('N) rejects_field', () => {
    const source = `
      public class Main {
        static int count = 0;
        public static int get() { return count; }
      }
    `;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_FIELD_UNSUPPORTED');
  });

  it('O) rejects_non_static_method', () => {
    const source = `
      public class Main {
        public int add(int a, int b) { return a + b; }
      }
    `;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_NON_STATIC_METHOD_UNSUPPORTED');
  });

  it('P) rejects_method_overloading', () => {
    const source = `
      public class Main {
        public static int a(int n) { return n; }
        public static int a(int n, int m) { return n + m; }
      }
    `;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_METHOD_OVERLOADING_UNSUPPORTED');
  });

  it('Q) rejects_system_out', () => {
    const source = `public class Main { public static void a() { System.out.println(1); } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_API_UNSUPPORTED');
  });

  it('R) rejects_runtime_processbuilder', () => {
    const source = `public class Main { public static void a() { new ProcessBuilder(); } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_API_UNSUPPORTED');
  });

  it('S) rejects_try_catch_throw', () => {
    const source = `public class Main { public static void a() throws Exception { throw new Exception(); } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_THROW_UNSUPPORTED');
  });

  it('T) rejects_switch', () => {
    const source = `public class Main { public static void a() { switch(1) {} } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_SWITCH_UNSUPPORTED');
  });

  it('U) rejects_do_while', () => {
    const source = `public class Main { public static void a() { do {} while(true); } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_DO_WHILE_UNSUPPORTED');
  });

  it('V) rejects_synchronized', () => {
    const source = `public class Main { public static synchronized void a() {} }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_SYNCHRONIZED_UNSUPPORTED');
  });

  it('W) rejects_lambda', () => {
    const source = `public class Main { public static void a() { x -> x + 1; } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_LAMBDA_UNSUPPORTED');
  });

  it('X) rejects_stream', () => {
    const source = `public class Main { public static void a() { arr.stream(); } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_STREAM_UNSUPPORTED');
  });

  it('Y) rejects_generics_collections', () => {
    const source = `public class Main { public static void a(List<Integer> x) {} }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_COLLECTION_UNSUPPORTED');
  });

  it('Z) rejects_enhanced_for', () => {
    const source = `public class Main { public static void a() { for(int x : arr) {} } }`;
    const v = validateJavaSupportedSyntax({ sourceCode: source });
    expect(v.map(e => e.code)).toContain('JAVA_ENHANCED_FOR_UNSUPPORTED');
  });

  it('AA) rejects_helper_method_call', () => {
    const source = `
      public class Main {
        public static int helper(int n) { return n + 1; }
        public static int main(int n) { return helper(n); }
      }
    `;
    const v = validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'main' });
    expect(v.map(e => e.code)).toContain('JAVA_METHOD_CALL_UNSUPPORTED');
  });

  it('AB) rejects_mutual_recursion', () => {
    const source = `
      public class Main {
        public static int a(int n) { return b(n); }
        public static int b(int n) { return a(n); }
      }
    `;
    const v = validateJavaSupportedSyntax({ sourceCode: source, entryFunction: 'a' });
    expect(v.map(e => e.code)).toContain('JAVA_METHOD_CALL_UNSUPPORTED');
  });

  it('AC) assert_throws_safe_error', () => {
    const source = `import java.util.*; public class Main {}`;
    expect(() => assertJavaSupportedSyntax({ sourceCode: source })).toThrow('Java code contains unsupported syntax for runtime tracing.');
    try {
      assertJavaSupportedSyntax({ sourceCode: source });
    } catch (err: any) {
      expect(err.message).not.toContain('import java.util.*;');
    }
  });
});
