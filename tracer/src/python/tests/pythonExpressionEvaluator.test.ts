import { describe, it, expect } from 'vitest';
import { evaluatePythonExpression } from '../evaluator/evaluateExpression';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';

describe('Python Expression Evaluator', () => {
  it('evaluates_number_literal', () => {
    expect(evaluatePythonExpression({ expression: '5', variables: {} })).toBe(5);
  });

  it('evaluates_arithmetic_precedence', () => {
    expect(evaluatePythonExpression({ expression: '1 + 2 * 3', variables: {} })).toBe(7);
  });

  it('evaluates_parentheses', () => {
    expect(evaluatePythonExpression({ expression: '(1 + 2) * 3', variables: {} })).toBe(9);
  });

  it('evaluates_identifier', () => {
    expect(evaluatePythonExpression({ expression: 'a + b', variables: { a: 2, b: 3 } })).toBe(5);
  });

  it('evaluates_string_literal', () => {
    expect(evaluatePythonExpression({ expression: '"hello"', variables: {} })).toBe('hello');
  });

  it('evaluates_string_concatenation', () => {
    expect(evaluatePythonExpression({ expression: '"hello" + " world"', variables: {} })).toBe('hello world');
  });

  it('evaluates_booleans_and_none', () => {
    expect(evaluatePythonExpression({ expression: 'True', variables: {} })).toBe(true);
    expect(evaluatePythonExpression({ expression: 'False', variables: {} })).toBe(false);
    expect(evaluatePythonExpression({ expression: 'None', variables: {} })).toBe(null);
  });

  it('rejects_unknown_identifier', () => {
    expect(() => evaluatePythonExpression({ expression: 'a', variables: {} })).toThrow('Unknown identifier');
  });

  it('rejects_function_call', () => {
    expect(() => evaluatePythonExpression({ expression: 'calc(x)', variables: { x: 5 } })).toThrow('Function calls are not supported');
  });

  it('rejects_eval_like_expression', () => {
    expect(() => evaluatePythonExpression({ expression: 'eval("1+1")', variables: { eval: null } })).toThrow();
  });

  it('evaluates_less_than', () => {
    expect(evaluatePythonExpression({ expression: '1 < 2', variables: {} })).toBe(true);
  });

  it('evaluates_less_than_or_equal', () => {
    expect(evaluatePythonExpression({ expression: '1 <= 1', variables: {} })).toBe(true);
  });

  it('evaluates_greater_than', () => {
    expect(evaluatePythonExpression({ expression: '3 > 2', variables: {} })).toBe(true);
  });

  it('evaluates_greater_than_or_equal', () => {
    expect(evaluatePythonExpression({ expression: '3 >= 3', variables: {} })).toBe(true);
  });

  it('evaluates_equal_numbers', () => {
    expect(evaluatePythonExpression({ expression: '3 == 3', variables: {} })).toBe(true);
  });

  it('evaluates_not_equal_numbers', () => {
    expect(evaluatePythonExpression({ expression: '3 != 4', variables: {} })).toBe(true);
  });

  it('evaluates_string_equality', () => {
    expect(evaluatePythonExpression({ expression: '"hi" == "hi"', variables: {} })).toBe(true);
  });

  it('evaluates_boolean_equality', () => {
    expect(evaluatePythonExpression({ expression: 'True == True', variables: {} })).toBe(true);
  });

  it('evaluates_empty_list_literal', () => {
    expect(evaluatePythonExpression({ expression: '[]', variables: {} })).toEqual([]);
  });

  it('evaluates_number_list_literal', () => {
    expect(evaluatePythonExpression({ expression: '[1, 2, 3]', variables: {} })).toEqual([1, 2, 3]);
  });

  it('evaluates_string_list_literal', () => {
    expect(evaluatePythonExpression({ expression: '["a", "b"]', variables: {} })).toEqual(['a', 'b']);
  });

  it('evaluates_identifier_index', () => {
    expect(evaluatePythonExpression({ expression: 'arr[1]', variables: { arr: [10, 20, 30] } })).toBe(20);
  });

  it('evaluates_expression_index', () => {
    expect(evaluatePythonExpression({ expression: 'arr[i + 1]', variables: { arr: [10, 20, 30], i: 0 } })).toBe(20);
  });

  it('evaluates_chained_index_if_supported', () => {
    expect(evaluatePythonExpression({ expression: 'matrix[1][0]', variables: { matrix: [[1, 2], [3, 4]] } })).toBe(3);
  });

  it('evaluates_len_list', () => {
    expect(evaluatePythonExpression({ expression: 'len(arr)', variables: { arr: [10, 20, 30] } })).toBe(3);
  });

  it('evaluates_len_string', () => {
    expect(evaluatePythonExpression({ expression: 'len("hello")', variables: {} })).toBe(5);
  });

  it('rejects_len_number', () => {
    expect(() => evaluatePythonExpression({ expression: 'len(5)', variables: {} })).toThrow('object has no len()');
  });

  it('rejects_unknown_function_call', () => {
    expect(() => evaluatePythonExpression({ expression: 'sum(arr)', variables: { arr: [10, 20, 30] } })).toThrow('Function calls are not supported');
  });

  it('rejects_out_of_range_index', () => {
    expect(() => evaluatePythonExpression({ expression: 'arr[5]', variables: { arr: [10, 20, 30] } })).toThrow('list index out of range');
  });

  it('rejects_negative_index', () => {
    expect(() => evaluatePythonExpression({ expression: 'arr[-1]', variables: { arr: [10, 20, 30] } })).toThrow('Negative indexing is not supported');
  });

  it('rejects_decimal_index', () => {
    expect(() => evaluatePythonExpression({ expression: 'arr[1.5]', variables: { arr: [10, 20, 30] } })).toThrow('list indices must be integers');
  });

  it('rejects_index_on_non_list', () => {
    expect(() => evaluatePythonExpression({ expression: 'arr[1]', variables: { arr: 5 } })).toThrow('object is not subscriptable');
  });

  it('delegates_function_call_to_handler', () => {
    const handler = ({ functionName, args }: any) => {
      if (functionName === 'factorial' && args[0] === 3) return 6;
      return null;
    };
    expect(evaluatePythonExpression({
      expression: 'factorial(n - 1)',
      variables: { n: 4 },
      onFunctionCall: handler
    })).toBe(6);
  });

  it('function_call_inside_binary_expression', () => {
    const handler = ({ functionName, args }: any) => {
      if (functionName === 'factorial' && args[0] === 3) return 6;
      return null;
    };
    expect(evaluatePythonExpression({
      expression: 'n * factorial(n - 1)',
      variables: { n: 4 },
      onFunctionCall: handler
    })).toBe(24);
  });

  it('rejects_function_call_without_handler', () => {
    expect(() => evaluatePythonExpression({
      expression: 'helper(n)',
      variables: { n: 4 }
    })).toThrow('Function calls are not supported');
  });
});
