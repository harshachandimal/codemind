/**
 * javascriptPreflight — static text-level safety checker for user-submitted
 * JavaScript source code.
 *
 * PURPOSE:
 * Provides an early rejection layer that blocks obviously dangerous or
 * unsupported JavaScript patterns before the source code reaches any
 * runtime tracing, AST parsing, or sandbox execution logic.
 *
 * IMPORTANT LIMITATIONS:
 * This is NOT a sandbox. It is NOT a replacement for sandboxing.
 * A determined attacker can craft obfuscated code that bypasses this check.
 * These rules exist to catch common mistakes and clearly unsupported patterns,
 * not to provide security guarantees on their own.
 *
 * SAFETY RULES:
 * - Do NOT execute sourceCode here.
 * - Do NOT use eval, Function constructor, or vm in this file.
 * - Do NOT import any Node.js built-ins that can run code.
 * - Inspection is regex/text-only.
 * - Violation messages must describe the pattern type — never echo source code.
 */

import { TraceSafetyError } from '../errors/TraceSafetyError.js';

// ─── Rule type ────────────────────────────────────────────────────────────────

type PreflightRule = {
  /** Short identifier for the rule, used in logs (not exposed to callers). */
  readonly label: string;
  /** Regex applied against the full source code string. */
  readonly pattern: RegExp;
  /** Safe user-facing violation message. Must not echo source code. */
  readonly message: string;
};

// ─── Dangerous pattern rules ──────────────────────────────────────────────────
//
// Rules are evaluated in order. All matching rules contribute violations —
// the check is exhaustive so callers receive a complete violation list
// rather than stopping at the first match.

const DANGEROUS_PATTERNS: readonly PreflightRule[] = [
  // ── Code execution ──────────────────────────────────────────────────────────
  {
    label: 'eval',
    pattern: /\beval\s*\(/,
    message: 'eval() is not allowed in runtime tracing.',
  },
  {
    label: 'new-Function',
    pattern: /\bnew\s+Function\s*\(/,
    message: 'new Function() is not allowed in runtime tracing.',
  },
  {
    label: 'Function-constructor',
    pattern: /\bFunction\s*\(/,
    message: 'The Function constructor is not allowed in runtime tracing.',
  },

  // ── Module system ───────────────────────────────────────────────────────────
  {
    label: 'require',
    pattern: /\brequire\s*\(/,
    message: 'require() is not allowed. Module imports are not supported in traces.',
  },
  {
    label: 'static-import',
    pattern: /^\s*import\s.+from\s+['"].+['"]/m,
    message: 'Static import statements are not supported in traces.',
  },
  {
    label: 'dynamic-import',
    pattern: /\bimport\s*\(/,
    message: 'Dynamic import() is not allowed in runtime tracing.',
  },

  // ── Node.js system access ───────────────────────────────────────────────────
  {
    label: 'process',
    pattern: /\bprocess\b/,
    message: 'Access to process is not allowed in runtime tracing.',
  },
  {
    label: 'child_process',
    pattern: /\bchild_process\b/,
    message: 'Access to child_process is not allowed in runtime tracing.',
  },
  {
    label: 'fs',
    pattern: /\bfs\b/,
    message: 'Access to fs (filesystem) is not allowed in runtime tracing.',
  },

  // ── Network APIs ────────────────────────────────────────────────────────────
  {
    label: 'fetch',
    pattern: /\bfetch\s*\(/,
    message: 'fetch() is not allowed. Network access is blocked in runtime tracing.',
  },
  {
    label: 'XMLHttpRequest',
    pattern: /\bXMLHttpRequest\b/,
    message: 'XMLHttpRequest is not allowed. Network access is blocked in runtime tracing.',
  },
  {
    label: 'WebSocket',
    pattern: /\bWebSocket\b/,
    message: 'WebSocket is not allowed. Network access is blocked in runtime tracing.',
  },

  // ── Browser / DOM globals ───────────────────────────────────────────────────
  {
    label: 'localStorage',
    pattern: /\blocalStorage\b/,
    message: 'localStorage is not available in runtime tracing.',
  },
  {
    label: 'sessionStorage',
    pattern: /\bsessionStorage\b/,
    message: 'sessionStorage is not available in runtime tracing.',
  },
  {
    label: 'document',
    pattern: /\bdocument\b/,
    message: 'document (DOM) is not available in runtime tracing.',
  },
  {
    label: 'window',
    pattern: /\bwindow\b/,
    message: 'window is not available in runtime tracing.',
  },
  {
    label: 'globalThis',
    pattern: /\bglobalThis\b/,
    message: 'globalThis is not allowed in runtime tracing.',
  },

  // ── Async / timing ──────────────────────────────────────────────────────────
  {
    label: 'setTimeout',
    pattern: /\bsetTimeout\s*\(/,
    message: 'setTimeout() is not allowed in runtime tracing.',
  },
  {
    label: 'setInterval',
    pattern: /\bsetInterval\s*\(/,
    message: 'setInterval() is not allowed in runtime tracing.',
  },

  // ── Obvious infinite loops ──────────────────────────────────────────────────
  {
    label: 'while-true',
    pattern: /while\s*\(\s*true\s*\)/,
    message: 'while(true) infinite loop is not allowed in runtime tracing.',
  },
  {
    label: 'for-ever',
    pattern: /for\s*\(\s*;\s*;\s*\)/,
    message: 'for(;;) infinite loop is not allowed in runtime tracing.',
  },

  // ── Prototype / constructor chain exploits ──────────────────────────────────
  {
    label: 'constructor-constructor',
    pattern: /constructor\s*\.\s*constructor/,
    message: 'constructor.constructor access is not allowed in runtime tracing.',
  },
  {
    label: '__proto__',
    pattern: /__proto__/,
    message: '__proto__ access is not allowed in runtime tracing.',
  },
  {
    label: 'prototype-bracket',
    pattern: /\bprototype\b\s*\[/,
    message: 'Dynamic prototype[] access is not allowed in runtime tracing.',
  },
];

// ─── Exported checker ─────────────────────────────────────────────────────────

/**
 * Runs static text-level preflight safety checks on JavaScript source code.
 *
 * Inspects `sourceCode` as a plain string — no execution, no parsing.
 * All matching rules are collected; the function throws a single
 * {@link TraceSafetyError} with all violations if any are found.
 *
 * @param sourceCode - The raw source code string to inspect.
 * @throws {TraceSafetyError} if any dangerous pattern is detected.
 */
export function runJavaScriptPreflight(sourceCode: string): void {
  const violations: string[] = [];

  for (const rule of DANGEROUS_PATTERNS) {
    if (rule.pattern.test(sourceCode)) {
      violations.push(rule.message);
    }
  }

  if (violations.length > 0) {
    throw new TraceSafetyError(
      'Trace request failed JavaScript safety preflight.',
      violations,
    );
  }
}
