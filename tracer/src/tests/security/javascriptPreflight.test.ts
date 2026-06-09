import { describe, it, expect } from 'vitest';
import { runJavaScriptPreflight } from '../../security/javascriptPreflight.js';
import { TraceSafetyError } from '../../errors/TraceSafetyError.js';

describe('javascriptPreflight', () => {
  it('allows_safe_simple_function', () => {
    const source = 'function add(a, b) { return a + b; }';
    expect(() => runJavaScriptPreflight(source)).not.toThrow();
  });

  it('blocks_eval', () => {
    const source = "function bad() { eval('2 + 2'); }";
    try {
      runJavaScriptPreflight(source);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceSafetyError);
      expect((e as TraceSafetyError).violations.some(v => v.includes('eval'))).toBe(true);
    }
  });

  it('blocks_require', () => {
    const source = "const fs = require('fs');";
    try {
      runJavaScriptPreflight(source);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceSafetyError);
      expect((e as TraceSafetyError).violations.some(v => v.includes('require') || v.includes('import'))).toBe(true);
    }
  });

  it('blocks_import_statement', () => {
    const source = "import fs from 'fs';";
    expect(() => runJavaScriptPreflight(source)).toThrow(TraceSafetyError);
  });

  it('blocks_process_access', () => {
    const source = "console.log(process.env);";
    expect(() => runJavaScriptPreflight(source)).toThrow(TraceSafetyError);
  });

  it('blocks_fetch', () => {
    const source = "fetch('https://example.com');";
    expect(() => runJavaScriptPreflight(source)).toThrow(TraceSafetyError);
  });

  it('blocks_dom_globals', () => {
    const source = "document.querySelector('body');";
    expect(() => runJavaScriptPreflight(source)).toThrow(TraceSafetyError);
  });

  it('blocks_obvious_infinite_while_loop', () => {
    const source = "function bad() { while (true) {} }";
    expect(() => runJavaScriptPreflight(source)).toThrow(TraceSafetyError);
  });

  it('blocks_obvious_infinite_for_loop', () => {
    const source = "function bad() { for (;;) {} }";
    expect(() => runJavaScriptPreflight(source)).toThrow(TraceSafetyError);
  });
});
