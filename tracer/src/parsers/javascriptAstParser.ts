/**
 * javascriptAstParser — parses JavaScript source code into a safe structural
 * summary using @babel/parser.
 *
 * PURPOSE:
 * Provides structural metadata (function declarations, loop/branch presence)
 * extracted from the AST without executing any code. This is the foundation
 * layer for future runtime tracing — understanding code shape before running it.
 *
 * SAFETY RULES:
 * - Do NOT execute sourceCode here.
 * - Do NOT use eval, Function constructor, or vm in this file.
 * - Do NOT expose the raw AST outside this module.
 * - Do NOT include raw source code in thrown error messages.
 * - @babel/parser is a pure parser — it does not execute code.
 */

import { parse } from '@babel/parser';
import type { Node, File } from '@babel/types';
import { TraceParseError } from '../errors/TraceParseError.js';
import type { AstSummary, FunctionSummary } from '../types/ast.js';

// ─── AST walker ───────────────────────────────────────────────────────────────

/**
 * Minimal recursive AST walker.
 * Visits every node in the AST and calls `visitor` on each one.
 * Avoids traversing non-object / non-array values and breaks cycles
 * by only following keys with string names on plain objects.
 */
function walk(node: unknown, visitor: (n: Node) => void): void {
  if (node === null || typeof node !== 'object') return;

  if (Array.isArray(node)) {
    for (const child of node) {
      walk(child, visitor);
    }
    return;
  }

  // Duck-type check: babel AST nodes always have a `type` string field.
  const record = node as Record<string, unknown>;
  if (typeof record['type'] === 'string') {
    visitor(record as unknown as Node);
  }

  // Recurse into child properties. Skip metadata-only keys that hold
  // no child nodes (keeps traversal fast and avoids false positives).
  const SKIP_KEYS = new Set(['loc', 'start', 'end', 'tokens', 'comments']);
  for (const key of Object.keys(record)) {
    if (SKIP_KEYS.has(key)) continue;
    walk(record[key], visitor);
  }
}

// ─── Parameter name extractor ─────────────────────────────────────────────────

/**
 * Extracts a safe parameter name string from a babel function param node.
 * Returns '?' for patterns too complex to represent as a simple identifier.
 */
function extractParamName(param: Node): string {
  if (param.type === 'Identifier') {
    return param.name;
  }
  if (param.type === 'AssignmentPattern') {
    // Default parameter: `a = 0` → use left-side name
    return extractParamName(param.left);
  }
  if (param.type === 'RestElement') {
    // Rest parameter: `...args`
    return extractParamName(param.argument);
  }
  // Destructuring or other complex patterns
  return '?';
}

// ─── Exported parser ──────────────────────────────────────────────────────────

/**
 * Parses JavaScript `sourceCode` and returns a safe {@link AstSummary}.
 *
 * The raw AST is never returned — only the high-level structural summary.
 * Source code is parsed but never evaluated.
 *
 * @param sourceCode - The raw JavaScript source string to parse.
 * @returns An {@link AstSummary} describing the structural shape of the code.
 * @throws {TraceParseError} if the source cannot be parsed. The error message
 *   never includes the raw source code or parser internals.
 */
export function parseJavaScriptToSummary(sourceCode: string): AstSummary {
  // ── Parse to AST ────────────────────────────────────────────────────────────
  let ast: File;

  try {
    ast = parse(sourceCode, {
      sourceType: 'script',
      // No plugins — keep it minimal for now.
      // Future steps may enable jsx, typescript, etc.
      plugins: [],
      // Collect all errors rather than throwing on first — lets us detect
      // syntax issues and throw a single safe TraceParseError.
      errorRecovery: false,
    });
  } catch {
    // Swallow the internal parser error to prevent stack trace / line number
    // leakage. Throw a safe, generic error instead.
    throw new TraceParseError('JavaScript source could not be parsed.');
  }

  // ── Walk AST and collect summary ────────────────────────────────────────────
  const functions: FunctionSummary[] = [];
  let hasForLoop = false;
  let hasWhileLoop = false;
  let hasIfStatement = false;
  let hasReturnStatement = false;

  walk(ast, (node: Node) => {
    switch (node.type) {
      // ── Function declarations ──────────────────────────────────────────────
      case 'FunctionDeclaration': {
        if (node.id != null) {
          const params = node.params.map(extractParamName);
          const line = node.loc?.start.line ?? null;
          functions.push({ name: node.id.name, params, line });
        }
        break;
      }

      // ── Loop constructs ────────────────────────────────────────────────────
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement': {
        hasForLoop = true;
        break;
      }

      case 'WhileStatement':
      case 'DoWhileStatement': {
        hasWhileLoop = true;
        break;
      }

      // ── Branch constructs ──────────────────────────────────────────────────
      case 'IfStatement': {
        hasIfStatement = true;
        break;
      }

      // ── Return statements ──────────────────────────────────────────────────
      case 'ReturnStatement': {
        hasReturnStatement = true;
        break;
      }
    }
  });

  return {
    functions,
    hasForLoop,
    hasWhileLoop,
    hasIfStatement,
    hasReturnStatement,
  };
}
