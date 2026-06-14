import type { MemberExpression, Identifier } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateExpression } from './evaluateExpression.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from '../core/getNodeLine.js';

/**
 * Evaluates a MemberExpression safely.
 *
 * Supported patterns:
 *   arr[i]           — computed index read on an Identifier
 *   arr.length       — length read on an Identifier
 *   arr[i][j]        — nested computed index read (MemberExpression object)
 *   arr[i].length    — length of a row in a 2-D array
 *
 * Rejected:
 *   - Non-array .length access
 *   - Method calls (handled by CallExpression)
 *   - Object property access
 *   - Negative, decimal, or out-of-range indices
 *   - Write operations (mutation not supported)
 */
export function evaluateMemberExpression(
  node: MemberExpression,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue {
  // ── Resolve the object (supports Identifier or nested MemberExpression) ───
  let arr: RuntimeValue;
  let objectLabel: string;

  if (node.object.type === 'Identifier') {
    const arrName = (node.object as Identifier).name;
    arr = env.getVariable(arrName);
    objectLabel = arrName;
  } else if (node.object.type === 'MemberExpression') {
    // Recursive evaluation for e.g. matrix[i][j] or matrix[i].length
    arr = evaluateMemberExpression(node.object as MemberExpression, env, fnName);
    objectLabel = '<nested>';
  } else {
    throw new TraceInterpreterError(
      `Array access object must be an identifier or array element in function "${fnName}".`,
      'UNSUPPORTED_EXPRESSION',
    );
  }

  if (!Array.isArray(arr)) {
    throw new TraceInterpreterError(
      `Cannot read property of non-array value in function "${fnName}".`,
      'TYPE_ERROR',
    );
  }

  // ── Case A: .length property ──────────────────────────────────────────────
  if (
    !node.computed &&
    node.property.type === 'Identifier' &&
    (node.property as Identifier).name === 'length'
  ) {
    const lengthValue = arr.length;
    env.recorder.record({
      line: getNodeLine(node),
      type: 'array_read',
      description: `Read ${objectLabel}.length as ${lengthValue}.`,
    });
    return lengthValue;
  }

  // ── Case B: arr[index] computed access ───────────────────────────────────
  if (node.computed) {
    const indexValue = evaluateExpression(node.property, env, fnName);

    if (typeof indexValue !== 'number' || !Number.isInteger(indexValue)) {
      throw new TraceInterpreterError(
        `Array index for "${objectLabel}" must be an integer in function "${fnName}".`,
        'TYPE_ERROR',
      );
    }

    if (indexValue < 0 || indexValue >= arr.length) {
      throw new TraceInterpreterError(
        `Array index out of bounds: ${objectLabel}[${indexValue}] in function "${fnName}". Length is ${arr.length}.`,
        'INDEX_OUT_OF_BOUNDS',
      );
    }

    const val = arr[indexValue] as RuntimeValue;
    env.recorder.record({
      line: getNodeLine(node),
      type: 'array_read',
      description: `Read ${objectLabel}[${indexValue}] as ${formatRuntimeValue(val)}.`,
    });
    return val;
  }

  throw new TraceInterpreterError(
    `Unsupported member expression. Only '.length' and '[index]' are supported in function "${fnName}".`,
    'UNSUPPORTED_EXPRESSION',
  );
}
