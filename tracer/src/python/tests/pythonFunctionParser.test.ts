import { describe, it, expect } from 'vitest';
import { parsePythonFunctions } from '../parser/parseFunctions';

describe('Python Function Parser', () => {
  it('parses_single_function', () => {
    const source = `def add(a, b):\n    return a + b`;
    const funcs = parsePythonFunctions(source);
    expect(funcs).toHaveLength(1);
    expect(funcs[0]!.name).toBe('add');
    expect(funcs[0]!.body[0]!.type).toBe('return');
  });

  it('parses_params', () => {
    const source = `def add(a, b):\n    pass`;
    const funcs = parsePythonFunctions(source);
    expect(funcs[0]!.params).toEqual(['a', 'b']);
  });

  it('ignores_blank_lines_and_comments', () => {
    const source = `
def add(a, b):
    # comment
    
    return a + b
    `;
    const funcs = parsePythonFunctions(source);
    expect(funcs[0]!.body[0]!.type).toBe('return');
  });

  it('rejects_nested_function', () => {
    const source = `
def outer():
    def inner():
        pass
    `;
    expect(() => parsePythonFunctions(source)).toThrow('Nested functions are not supported');
  });

  it('handles_two_top_level_functions', () => {
    const source = `
def add(a, b):
    return a + b
def sub(a, b):
    return a - b
    `;
    const funcs = parsePythonFunctions(source);
    expect(funcs).toHaveLength(2);
    expect(funcs[1]!.name).toBe('sub');
  });
});
