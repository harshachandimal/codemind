import type { AssignmentExpression, Identifier } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import { evaluateExpression } from '../expressions/evaluateExpression.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from '../core/getNodeLine.js';

export function executeAssignmentExpression(
  node: AssignmentExpression,
  env: InterpreterEnvironment,
  fnName: string,
): void {
  if (node.operator !== '=') {
    throw new TraceInterpreterError(
      `Compound assignment operator "${node.operator}" is not supported.`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  if (node.left.type !== 'Identifier') {
    throw new TraceInterpreterError(
      `Assignment to non-identifiers is not supported.`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  const varName = (node.left as Identifier).name;
  const newValue = evaluateExpression(node.right, env, fnName);

  env.assignVariable(varName, newValue);

  env.recorder.record({
    line: getNodeLine(node),
    type: 'assignment',
    description: `Variable ${varName} was assigned value ${formatRuntimeValue(newValue)}.`,
  });
}


