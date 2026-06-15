import { describe, it, expect } from 'vitest';
import { parseJavaStatements } from '../parser/parseStatements';

describe('javaStatementParser', () => {
  it('A) parses_variable_declaration_with_init', () => {
    const stmts = parseJavaStatements('int result = a + b;');
    expect(stmts[0]).toEqual({
      type: 'variable_declaration',
      typeName: 'int',
      name: 'result',
      expression: 'a + b'
    });
  });

  it('B) parses_variable_declaration_without_init', () => {
    const stmts = parseJavaStatements('int result;');
    expect(stmts[0]).toEqual({
      type: 'variable_declaration',
      typeName: 'int',
      name: 'result',
      expression: null
    });
  });

  it('C) parses_assignment', () => {
    const stmts = parseJavaStatements('result = result + 1;');
    expect(stmts[0]).toEqual({
      type: 'assignment',
      name: 'result',
      expression: 'result + 1'
    });
  });

  it('D) parses_return_expression', () => {
    const stmts = parseJavaStatements('return result;');
    expect(stmts[0]).toEqual({
      type: 'return',
      expression: 'result'
    });
  });

  it('E) parses_empty_return', () => {
    const stmts = parseJavaStatements('return;');
    expect(stmts[0]).toEqual({
      type: 'return',
      expression: null
    });
  });

  it('F) parses_simple_if_return', () => {
    const code = `
      if (n > 0) {
        return true;
      }
      return false;
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts[0]).toEqual({
      type: 'if',
      branches: [
        {
          condition: 'n > 0',
          body: [{ type: 'return', expression: 'true' }]
        }
      ],
      elseBody: null
    });
    expect(stmts[1]).toEqual({ type: 'return', expression: 'false' });
  });

  it('G) parses_if_else', () => {
    const code = `
      if (n > 0) {
        return "positive";
      } else {
        return "zero_or_negative";
      }
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts[0]).toEqual({
      type: 'if',
      branches: [
        { condition: 'n > 0', body: [{ type: 'return', expression: '"positive"' }] }
      ],
      elseBody: [{ type: 'return', expression: '"zero_or_negative"' }]
    });
  });

  it('H) parses_else_if_else', () => {
    const code = `
      if (n > 0) {
        return "positive";
      } else if (n < 0) {
        return "negative";
      } else {
        return "zero";
      }
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts[0]).toEqual({
      type: 'if',
      branches: [
        { condition: 'n > 0', body: [{ type: 'return', expression: '"positive"' }] },
        { condition: 'n < 0', body: [{ type: 'return', expression: '"negative"' }] }
      ],
      elseBody: [{ type: 'return', expression: '"zero"' }]
    });
  });

  it('I) parses_assignment_inside_if', () => {
    const code = `
      String result = "small";
      if (n > 10) {
        result = "big";
      }
      return result;
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts.length).toBe(3);
    expect(stmts[0]!.type).toBe('variable_declaration');
    expect(stmts[1]!.type).toBe('if');
    expect(stmts[2]!.type).toBe('return');
  });

  it('J) parses_nested_if_if_practical', () => {
    const code = `
      if (n > 0) {
        if (n > 100) {
          return "huge";
        }
        return "positive";
      }
    `;
    const stmts = parseJavaStatements(code);
    const ifStmt = stmts[0] as any;
    expect(ifStmt.branches[0].body[0].type).toBe('if');
  });

  it('K) parses_while_loop', () => {
    const code = `
      int i = 0;
      while (i < n) {
        i++;
      }
      return i;
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts[1]!.type).toBe('while');
    const whileStmt = stmts[1] as any;
    expect(whileStmt.condition).toBe('i < n');
    expect(whileStmt.body[0].type).toBe('increment');
  });

  it('L) parses_for_loop_with_declaration_init', () => {
    const code = `
      for (int i = 0; i < n; i++) {
        result += i;
      }
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts[0]!.type).toBe('for');
    const forStmt = stmts[0] as any;
    expect(forStmt.init.type).toBe('variable_declaration');
    expect(forStmt.condition).toBe('i < n');
    expect(forStmt.update.type).toBe('increment');
  });

  it('M) parses_for_loop_with_assignment_init', () => {
    const code = `
      int i = 0;
      for (i = 0; i < n; i++) {
        result += i;
      }
    `;
    const stmts = parseJavaStatements(code);
    expect(stmts[1]!.type).toBe('for');
    const forStmt = stmts[1] as any;
    expect(forStmt.init.type).toBe('assignment');
  });

  it('N) parses_for_loop_with_augmented_update', () => {
    const code = `
      for (int i = 0; i < n; i += 1) {
        result += i;
      }
    `;
    const stmts = parseJavaStatements(code);
    const forStmt = stmts[0] as any;
    expect(forStmt.update.type).toBe('augmented_assignment');
    expect(forStmt.update.operator).toBe('+=');
  });

  it('O) parses_nested_for_loop', () => {
    const code = `
      for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
          count++;
        }
      }
    `;
    const stmts = parseJavaStatements(code);
    const outerFor = stmts[0] as any;
    expect(outerFor.body[0].type).toBe('for');
  });

  it('P) parses_mixed_for_while_loop', () => {
    const code = `
      for (int i = 0; i < n; i++) {
        while (j < n) {
          count++;
        }
      }
    `;
    const stmts = parseJavaStatements(code);
    const outerFor = stmts[0] as any;
    expect(outerFor.body[0].type).toBe('while');
  });

  it('Q) rejects_enhanced_for_loop', () => {
    expect(() => parseJavaStatements('for (int x : arr) { }'))
      .toThrowError('JAVA_UNSUPPORTED_STATEMENT');
  });

  it('R) rejects_malformed_for_header', () => {
    expect(() => parseJavaStatements('for (int i = 0; i < n) { }'))
      .toThrowError('JAVA_PARSE_ERROR');
  });

  it('S) rejects_malformed_if_missing_brace', () => {
    expect(() => parseJavaStatements('if (n > 0) return true;'))
      .toThrowError('JAVA_PARSE_ERROR');
  });

  it('T) rejects_unsupported_type', () => {
    expect(() => parseJavaStatements('float x = 1.0;'))
      .toThrowError('JAVA_UNSUPPORTED_STATEMENT');
  });

  it('U) rejects_multiple_declaration', () => {
    expect(() => parseJavaStatements('int a = 1, b = 2;'))
      .toThrowError('JAVA_UNSUPPORTED_STATEMENT');
  });

  it('V) parses_array_declaration_initializer', () => {
    const stmts = parseJavaStatements('int[] arr = {1, 2, 3};');
    expect(stmts[0]).toEqual({
      type: 'variable_declaration',
      typeName: 'int[]',
      name: 'arr',
      expression: '{1, 2, 3}'
    });
  });

  it('W) parses_string_array_initializer', () => {
    const stmts = parseJavaStatements('String[] names = {"a", "b"};');
    expect(stmts[0]).toEqual({
      type: 'variable_declaration',
      typeName: 'String[]',
      name: 'names',
      expression: '{"a", "b"}'
    });
  });
});
