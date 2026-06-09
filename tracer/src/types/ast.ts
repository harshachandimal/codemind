/**
 * AST summary type contracts for the CodeMind tracer service.
 *
 * These types describe the safe structural metadata extracted from a
 * parsed JavaScript AST. The raw AST is never exposed outside the
 * parser module — only this high-level summary is returned.
 *
 * No code execution is performed to produce these values.
 */

/**
 * Summary of a single function declaration found in the parsed source.
 */
export type FunctionSummary = {
  /** Name of the declared function. */
  name: string;
  /** Names of the function's parameters, in declaration order. */
  params: string[];
  /** Source line where the function declaration starts, or null if unavailable. */
  line: number | null;
};

/**
 * Safe high-level structural summary of a parsed JavaScript source file.
 * Used by TraceService to understand code shape without executing it.
 */
export type AstSummary = {
  /** All top-level and nested function declarations found in the source. */
  functions: FunctionSummary[];
  /** Whether any for/for-in/for-of loop was found. */
  hasForLoop: boolean;
  /** Whether any while or do-while loop was found. */
  hasWhileLoop: boolean;
  /** Whether any if/else-if statement was found. */
  hasIfStatement: boolean;
  /** Whether any return statement was found. */
  hasReturnStatement: boolean;
};
