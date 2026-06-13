/**
 * JavaScriptInterpreter — safe AST-walking interpreter for a limited JavaScript subset.
 *
 * EXECUTION METHOD: AST interpretation only.
 * - Parses source code with @babel/parser.
 * - Walks the resulting AST manually.
 * - Evaluates only explicitly supported node types.
 * - All other node types immediately throw TraceInterpreterError.
 *
 * STRICTLY FORBIDDEN:
 * - eval()
 * - new Function()
 * - vm.runInContext() / vm.runInNewContext()
 * - Child process spawning
 * - Any form of dynamic code execution
 *
 * SUPPORTED SYNTAX (MVP):
 * - FunctionDeclaration
 * - BlockStatement
 * - ReturnStatement
 * - VariableDeclaration (let, const)
 * - AssignmentExpression (= operator, Identifier left side only)
 * - ExpressionStatement wrapping AssignmentExpression or UpdateExpression
 * - ForStatement (numeric counter, BlockStatement body, i++/i-- update)
 * - WhileStatement (boolean condition, BlockStatement body)
 * - UpdateExpression: i++, i-- (postfix only)
 * - IfStatement (test evaluating to boolean, BlockStatement branches, else-if support)
 * - MemberExpression (array index reads `arr[i]`, array length `arr.length` only)
 * - NumericLiteral, StringLiteral, BooleanLiteral, NullLiteral
 * - Identifier (function parameters and declared locals)
 * - BinaryExpression: +, -, *, /, <, <=, >, >=, ===, !==
 *
 * UNSUPPORTED (throws TraceInterpreterError):
 * - do-while loops, for-of, for-in
 * - classes, async, closures,
 *   arbitrary call expressions, arbitrary member expressions, objects,
 *   compound assignments (+=, -=, etc.), destructuring, var.
 * - break, continue, prefix ++/-- as statements
 */

import { parse } from '@babel/parser';
import { InterpreterEnvironment } from './InterpreterEnvironment.js';
import type { InterpreterResult, RuntimeValue } from '../types/interpreter.js';
import type { TraceRequest } from '../types/trace.js';
import { findEntryFunction } from './core/findEntryFunction.js';
import { executeFunctionCall } from './core/executeFunctionCall.js';
import { TraceInterpreterError } from '../errors/TraceInterpreterError.js';

export class JavaScriptInterpreter {
  /**
   * Interpret a validated TraceRequest using safe AST walking.
   * Never executes JavaScript via eval/vm/Function.
   *
   * @throws {TraceInterpreterError} for unsupported syntax, missing function,
   *   or exceeded limits.
   */
  public interpret(request: TraceRequest): InterpreterResult {
    const env = new InterpreterEnvironment();

    // ── Parse ────────────────────────────────────────────────────────────────
    const ast = parse(request.sourceCode, { sourceType: 'script' });

    // ── Build Function Registry ──────────────────────────────────────────────
    for (const statement of ast.program.body) {
      if (statement.type === 'FunctionDeclaration' && statement.id) {
        const fnName = statement.id.name;
        if (env.functionRegistry.has(fnName)) {
          throw new TraceInterpreterError(
            `Duplicate function declaration for "${fnName}".`,
            'DUPLICATE_FUNCTION_DECLARATION'
          );
        }
        env.functionRegistry.set(fnName, statement);
      }
    }

    // ── Find entry function ──────────────────────────────────────────────────
    const targetFn = findEntryFunction(ast.program, request.entryFunction ?? null);

    // ── Prepare arguments ────────────────────────────────────────────────────
    const args = (request.input ?? []) as RuntimeValue[];

    // ── Execute function call ────────────────────────────────────────────────
    try {
      executeFunctionCall(targetFn, env, args);
    } catch (err: unknown) {
      env.state.status = 'error';
      throw err; // The service layer will catch and wrap this
    }

    env.state.status = 'completed';

    // ── Return structured result ─────────────────────────────────────────────
    return {
      success: true,
      steps: env.recorder.getSteps(),
      finalState: env.state,
      terminatedReason: 'completed',
    };
  }
}
