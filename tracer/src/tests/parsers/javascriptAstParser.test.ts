import { describe, it, expect } from 'vitest';
import { parseJavaScriptToSummary } from '../../parsers/javascriptAstParser.js';
import { TraceParseError } from '../../errors/TraceParseError.js';

describe('javascriptAstParser', () => {
  it('parses_function_summary', () => {
    const source = `
function add(a, b) {
  return a + b;
}
    `.trim();

    const summary = parseJavaScriptToSummary(source);

    expect(summary.functions.length).toBe(1);
    expect(summary.functions[0]?.name).toBe('add');
    expect(summary.functions[0]?.params).toEqual(['a', 'b']);
    expect(summary.hasReturnStatement).toBe(true);
  });

  it('detects_for_loop', () => {
    const source = `
function sum(arr) {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}
    `.trim();

    const summary = parseJavaScriptToSummary(source);

    expect(summary.hasForLoop).toBe(true);
  });

  it('detects_while_loop', () => {
    const source = `
function shrink(n) {
  while (n > 1) {
    n = n / 2;
  }
}
    `.trim();

    const summary = parseJavaScriptToSummary(source);

    expect(summary.hasWhileLoop).toBe(true);
  });

  it('detects_if_statement', () => {
    const source = `
function check(n) {
  if (n > 0) {
    return true;
  }
  return false;
}
    `.trim();

    const summary = parseJavaScriptToSummary(source);

    expect(summary.hasIfStatement).toBe(true);
    expect(summary.hasReturnStatement).toBe(true);
  });

  it('throws_safe_parse_error_for_invalid_js', () => {
    const source = 'function broken( {';

    let thrown: unknown;
    try {
      parseJavaScriptToSummary(source);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(TraceParseError);

    // Critical safety check: error message must NOT echo source code back
    const errorMessage = (thrown as TraceParseError).message;
    expect(errorMessage).not.toContain('function broken');
    expect(errorMessage).not.toContain(source);
    expect(errorMessage).toBe('JavaScript source could not be parsed.');
  });
});
