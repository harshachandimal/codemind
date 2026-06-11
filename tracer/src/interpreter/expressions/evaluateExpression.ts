import type { Node, NumericLiteral, StringLiteral, BooleanLiteral, Identifier, BinaryExpression, MemberExpression } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateBinary } from './evaluateBinaryExpression.js';
import { evaluateMemberExpression } from './evaluateMemberExpression.js';

export function evaluateExpression(
  node: Node,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue {
  switch (node.type) {
    case 'NumericLiteral':
      return (node as NumericLiteral).value;

    case 'StringLiteral':
      return (node as StringLiteral).value;

    case 'BooleanLiteral':
      return (node as BooleanLiteral).value;

    case 'NullLiteral':
      return null;

    case 'Identifier': {
      const ident = node as Identifier;
      return env.getVariable(ident.name);
    }

    case 'BinaryExpression':
      return evaluateBinary(node as BinaryExpression, env, fnName);

    case 'MemberExpression':
      return evaluateMemberExpression(node as MemberExpression, env, fnName);

    default:
      throw new TraceInterpreterError(
        `Unsupported expression type "${node.type}" in function "${fnName}".`,
        'UNSUPPORTED_EXPRESSION',
      );
  }
}


