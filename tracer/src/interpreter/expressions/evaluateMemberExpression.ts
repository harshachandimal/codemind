import type { MemberExpression, Identifier } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateExpression } from './evaluateExpression.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from '../core/getNodeLine.js';

export function evaluateMemberExpression(
  node: MemberExpression,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue {
  if (node.object.type !== 'Identifier') {
    throw new TraceInterpreterError(
      `Array access must be directly on an identifier in function "${fnName}".`,
      'UNSUPPORTED_EXPRESSION',
    );
  }
  const arrName = (node.object as Identifier).name;
  const arr = env.getVariable(arrName);

  if (!Array.isArray(arr)) {
    throw new TraceInterpreterError(
      `Cannot read property of non-array variable "${arrName}" in function "${fnName}".`,
      'TYPE_ERROR',
    );
  }

  // Case A: arr.length
  if (!node.computed && node.property.type === 'Identifier' && (node.property as Identifier).name === 'length') {
    const lengthValue = arr.length;
    env.recorder.record({
      line: getNodeLine(node),
      type: 'array_read',
      description: `Read ${arrName}.length as ${lengthValue}.`,
    });
    return lengthValue;
  }

  // Case B: arr[i] (computed access)
  if (node.computed) {
    const indexValue = evaluateExpression(node.property, env, fnName);
    
    if (typeof indexValue !== 'number' || !Number.isInteger(indexValue)) {
      throw new TraceInterpreterError(
        `Array index for "${arrName}" must be an integer in function "${fnName}".`,
        'TYPE_ERROR',
      );
    }
    
    if (indexValue < 0 || indexValue >= arr.length) {
      throw new TraceInterpreterError(
        `Array index out of bounds: ${arrName}[${indexValue}] in function "${fnName}". Length is ${arr.length}.`,
        'INDEX_OUT_OF_BOUNDS',
      );
    }

    const val = arr[indexValue] as RuntimeValue;
    env.recorder.record({
      line: getNodeLine(node),
      type: 'array_read',
      description: `Read ${arrName}[${indexValue}] as ${formatRuntimeValue(val)}.`,
    });
    return val;
  }

  throw new TraceInterpreterError(
    `Unsupported member expression. Only 'arr.length' and 'arr[index]' are supported in function "${fnName}".`,
    'UNSUPPORTED_EXPRESSION',
  );
}


