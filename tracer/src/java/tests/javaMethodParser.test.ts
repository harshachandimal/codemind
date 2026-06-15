import { describe, it, expect } from 'vitest';
import { parseJavaMethods } from '../parser/parseMethods';
import { assertJavaSupportedSyntax } from '../utils/javaUnsupportedNodes';

describe('javaMethodParser', () => {
  it('A) parses_single_static_method', () => {
    const source = 'public class Main { public static int add(int a, int b) { int result = a + b; return result; } }';
    const methods = parseJavaMethods(source) as any;
    expect(methods.length).toBe(1);
    expect(methods[0].name).toBe('add');
    expect(methods[0].returnType).toBe('int');
    expect(methods[0].bodyText).toBe('int result = a + b; return result;');
  });

  it('B) parses_params', () => {
    const source = 'public class Main { public static void test(int x, double y, String z, boolean b) {} }';
    const methods = parseJavaMethods(source) as any;
    expect(methods[0].params.length).toBe(4);
    expect(methods[0].params[0]).toEqual({ typeName: 'int', name: 'x' });
    expect(methods[0].params[1]).toEqual({ typeName: 'double', name: 'y' });
    expect(methods[0].params[2]).toEqual({ typeName: 'String', name: 'z' });
    expect(methods[0].params[3]).toEqual({ typeName: 'boolean', name: 'b' });
  });

  it('C) parses_return_type', () => {
    const source = 'public class Main { public static String get() { return "hello"; } }';
    const methods = parseJavaMethods(source) as any;
    expect(methods[0].returnType).toBe('String');
  });

  it('D) handles_two_static_methods', () => {
    const source = 'public class Main { public static int a() { return 1; } public static int b() { return 2; } }';
    const methods = parseJavaMethods(source) as any;
    expect(methods.length).toBe(2);
    expect(methods[0].name).toBe('a');
    expect(methods[1].name).toBe('b');
  });

  it('E) ignores_comments', () => {
    const source = 'public class Main { public static int add(int a, int b) { // comment\n int result = a + b; /* inline */ return result; } }';
    const methods = parseJavaMethods(source) as any;
    expect(methods[0].bodyText).toContain('int result = a + b;');
  });

  it('F) rejects_non_static_method', () => {
    const source = 'public class Main { public int add(int a, int b) { return a + b; } }';
    expect(() => assertJavaSupportedSyntax({ sourceCode: source })).toThrowError('Java code contains unsupported syntax for runtime tracing.');
  });

  it('G) rejects_nested_method_or_bad_body', () => {
    const source = 'public class Main { public static void bad() { public static void nested() { } } }';
    expect(() => parseJavaMethods(source)).toThrowError();
  });

  it('H) parses_array_params_and_return', () => {
    const source = 'public class Main { public static int[] getArr(int[] a, String[] s, int[][] m) { return a; } }';
    const methods = parseJavaMethods(source) as any;
    expect(methods[0].returnType).toBe('int[]');
    expect(methods[0].params.length).toBe(3);
    expect(methods[0].params[0]).toEqual({ typeName: 'int[]', name: 'a' });
    expect(methods[0].params[1]).toEqual({ typeName: 'String[]', name: 's' });
    expect(methods[0].params[2]).toEqual({ typeName: 'int[][]', name: 'm' });
  });
});
