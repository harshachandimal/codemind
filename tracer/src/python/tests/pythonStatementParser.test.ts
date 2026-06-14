import { describe, it, expect } from 'vitest';
import { parsePythonStatements } from '../parser/parseStatements';

describe('Python Statement Parser', () => {
  it('parses_simple_if_return', () => {
    const source = `
if n > 0:
    return True
return False`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]!.type).toBe('if');
    expect((stmts[0] as any).branches[0].body[0].type).toBe('return');
    expect(stmts[1]!.type).toBe('return');
  });

  it('parses_if_else', () => {
    const source = `
if n > 0:
    return "positive"
else:
    return "zero_or_negative"`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]!.type).toBe('if');
    expect((stmts[0] as any).elseBody).toBeTruthy();
  });

  it('parses_if_elif_else', () => {
    const source = `
if n > 0:
    return "positive"
elif n < 0:
    return "negative"
else:
    return "zero"`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]!.type).toBe('if');
    expect((stmts[0] as any).branches).toHaveLength(2);
    expect((stmts[0] as any).elseBody).toBeTruthy();
  });

  it('parses_assignment_inside_if', () => {
    const source = `
result = "small"
if n > 10:
    result = "big"
return result`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(3);
    expect(stmts[0]!.type).toBe('assignment');
    expect(stmts[1]!.type).toBe('if');
    expect(stmts[2]!.type).toBe('return');
  });

  it('parses_while_loop', () => {
    const source = `
i = 0
while i < n:
    i += 1
return i`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(3);
    expect(stmts[0]!.type).toBe('assignment');
    expect(stmts[1]!.type).toBe('while');
    expect(stmts[2]!.type).toBe('return');
    
    const whileStmt = stmts[1] as any;
    expect(whileStmt.condition).toBe('i < n');
    expect(whileStmt.body).toHaveLength(1);
    expect(whileStmt.body[0].type).toBe('augmented_assignment');
    expect(whileStmt.body[0].operator).toBe('+=');
  });

  it('parses_for_range_stop', () => {
    const source = `
for i in range(n):
    result += i
return result`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]!.type).toBe('for_range');
    
    const forStmt = stmts[0] as any;
    expect(forStmt.variableName).toBe('i');
    expect(forStmt.rangeArgs).toEqual(['n']);
    expect(forStmt.body).toHaveLength(1);
  });

  it('parses_for_range_start_stop', () => {
    const source = `
for i in range(1, n):
    pass`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(1);
    expect((stmts[0] as any).rangeArgs).toEqual(['1', 'n']);
  });

  it('parses_for_range_start_stop_step', () => {
    const source = `
for i in range(1, n, 2):
    pass`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(1);
    expect((stmts[0] as any).rangeArgs).toEqual(['1', 'n', '2']);
  });

  it('rejects_for_non_range', () => {
    const source = `
for item in arr:
    pass`.split('\n');
    expect(() => parsePythonStatements(source, 0)).toThrow('Unsupported for statement');
  });

  it('rejects_malformed_range', () => {
    const source = `
for i in range():
    pass`.split('\n');
    expect(() => parsePythonStatements(source, 0)).toThrow('Unsupported range arguments');
  });

  it('parses_nested_for_range', () => {
    const source = `
for i in range(n):
    for j in range(n):
        count += 1`.split('\n');
    const stmts = parsePythonStatements(source, 0);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]!.type).toBe('for_range');
    expect((stmts[0] as any).body[0].type).toBe('for_range');
  });

  it('rejects_bad_indentation_safely', () => {
    const source = `
if n > 0:
return "positive"`.split('\n');
    expect(() => parsePythonStatements(source, 0)).toThrow('Expected indented block');
  });
});
