import { describe, it, expect } from 'vitest';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';

describe('javaExpressionEvaluator', () => {
  const evaluate = (expr: string) => evaluateJavaExpression({ expression: expr, variables: new Map() });

  it('evaluates basic arithmetic', () => {
    expect(evaluate('1 + 2')).toBe(3);
    expect(evaluate('10 - 4')).toBe(6);
    expect(evaluate('3 * 4')).toBe(12);
    expect(evaluate('10 / 2')).toBe(5);
    expect(evaluate('10 % 3')).toBe(1);
  });

  it('A) evaluates_less_than', () => {
    expect(evaluate('1 < 2')).toBe(true);
    expect(evaluate('2 < 1')).toBe(false);
  });

  it('B) evaluates_less_than_or_equal', () => {
    expect(evaluate('1 <= 1')).toBe(true);
    expect(evaluate('2 <= 1')).toBe(false);
  });

  it('C) evaluates_greater_than', () => {
    expect(evaluate('3 > 2')).toBe(true);
    expect(evaluate('2 > 3')).toBe(false);
  });

  it('D) evaluates_greater_than_or_equal', () => {
    expect(evaluate('3 >= 3')).toBe(true);
    expect(evaluate('2 >= 3')).toBe(false);
  });

  it('E) evaluates_equal_numbers', () => {
    expect(evaluate('3 == 3')).toBe(true);
    expect(evaluate('3 == 4')).toBe(false);
  });

  it('F) evaluates_not_equal_numbers', () => {
    expect(evaluate('3 != 4')).toBe(true);
    expect(evaluate('3 != 3')).toBe(false);
  });

  it('G) evaluates_string_equality', () => {
    expect(evaluate('"hi" == "hi"')).toBe(true);
    expect(evaluate('"hi" == "hello"')).toBe(false);
  });

  it('H) evaluates_boolean_equality', () => {
    expect(evaluate('true == true')).toBe(true);
    expect(evaluate('true == false')).toBe(false);
  });

  it('I) evaluates_boolean_and', () => {
    expect(evaluate('true && false')).toBe(false);
    expect(evaluate('true && true')).toBe(true);
  });

  it('J) evaluates_boolean_or', () => {
    expect(evaluate('true || false')).toBe(true);
    expect(evaluate('false || false')).toBe(false);
  });

  it('K) evaluates_boolean_not', () => {
    expect(evaluate('!false')).toBe(true);
    expect(evaluate('!true')).toBe(false);
  });

  it('L) rejects_invalid_comparison_type', () => {
    expect(() => evaluate('"hi" < 2')).toThrowError('JAVA_RUNTIME_TYPE_ERROR');
    expect(() => evaluate('true < false')).toThrowError('JAVA_RUNTIME_TYPE_ERROR');
  });

  it('evaluates parentheses', () => {
    expect(evaluate('(1 + 2) * 3')).toBe(9);
    expect(evaluate('!(true && false)')).toBe(true);
  });

  describe('Array evaluation', () => {
    const runArrayExpr = (expr: string, vars: any) => {
      const variables = new Map(Object.entries(vars)) as any;
      return evaluateJavaExpression({ expression: expr, variables });
    };

    const mockArr = { type: 'array', elementType: 'int', value: [10, 20, 30] };
    const mockMatrix = { type: 'array', elementType: 'array', value: [
      { type: 'array', elementType: 'int', value: [1, 2] },
      { type: 'array', elementType: 'int', value: [3, 4] }
    ]};

    it('A) evaluates_array_index', () => {
      expect(runArrayExpr('arr[1]', { arr: mockArr })).toBe(20);
    });

    it('B) evaluates_expression_index', () => {
      expect(runArrayExpr('arr[i + 1]', { arr: mockArr, i: 0 })).toBe(20);
    });

    it('C) evaluates_array_length', () => {
      expect(runArrayExpr('arr.length', { arr: mockArr })).toBe(3);
    });

    it('D) evaluates_chained_index_if_supported', () => {
      expect(runArrayExpr('matrix[1][0]', { matrix: mockMatrix })).toBe(3);
    });

    it('E) rejects_out_of_range_index', () => {
      expect(() => runArrayExpr('arr[5]', { arr: mockArr })).toThrowError('JAVA_RUNTIME_LIMIT_EXCEEDED');
    });

    it('F) rejects_negative_index', () => {
      expect(() => runArrayExpr('arr[-1]', { arr: mockArr })).toThrowError('JAVA_RUNTIME_TYPE_ERROR');
    });

    it('G) rejects_decimal_index', () => {
      expect(() => runArrayExpr('arr[1.5]', { arr: mockArr })).toThrowError('JAVA_RUNTIME_TYPE_ERROR');
    });

    it('H) rejects_index_on_non_array', () => {
      expect(() => runArrayExpr('arr[0]', { arr: 5 })).toThrowError('JAVA_RUNTIME_TYPE_ERROR');
    });

    it('I) rejects_length_on_non_array', () => {
      expect(() => runArrayExpr('arr.length', { arr: "hello" })).toThrowError('JAVA_RUNTIME_TYPE_ERROR');
    });

    it('J) rejects_unknown_property', () => {
      expect(() => runArrayExpr('arr.size', { arr: mockArr })).toThrowError('JAVA_UNSUPPORTED_EXPRESSION');
    });

    it('evaluates local array initializer', () => {
      expect(evaluate('{1, 2, 3}')).toEqual({ type: 'array', elementType: 'int', value: [1, 2, 3] });
      expect(evaluate('{"a", "b"}')).toEqual({ type: 'array', elementType: 'String', value: ["a", "b"] });
    });
  describe('Method Calls', () => {
    it('A) delegates_method_call_to_handler', () => {
      const vars = new Map();
      vars.set('n', 4);
      let handlerCalled = false;
      const onMethodCall = (params: any) => {
        handlerCalled = true;
        expect(params.methodName).toBe('factorial');
        expect(params.args).toEqual([3]);
        return 6;
      };
      const result = evaluateJavaExpression({ expression: 'factorial(n - 1)', variables: vars, onMethodCall });
      expect(result).toBe(6);
      expect(handlerCalled).toBe(true);
    });

    it('B) method_call_inside_binary_expression', () => {
      const vars = new Map();
      vars.set('n', 4);
      const onMethodCall = (params: any) => {
        return 6; // mock factorial(3) = 6
      };
      const result = evaluateJavaExpression({ expression: 'n * factorial(n - 1)', variables: vars, onMethodCall });
      expect(result).toBe(24);
    });

    it('C) rejects_method_call_without_handler', () => {
      const vars = new Map();
      vars.set('n', 4);
      expect(() => evaluateJavaExpression({ expression: 'helper(n)', variables: vars }))
        .toThrowError('JAVA_METHOD_CALL_UNSUPPORTED: Method calls are not supported');
    });

    it('D) rejects_dotted_method_call', () => {
      const vars = new Map();
      vars.set('a', 1);
      vars.set('b', 2);
      expect(() => evaluateJavaExpression({ expression: 'Math.max(a, b)', variables: vars }))
        .toThrowError('JAVA_VARIABLE_NOT_FOUND: Math is not defined');
    });
  });
  });
});
