import type { Node, NumericLiteral, StringLiteral, BooleanLiteral, Identifier, BinaryExpression, MemberExpression, CallExpression } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateBinary } from './evaluateBinaryExpression.js';
import { evaluateMemberExpression } from './evaluateMemberExpression.js';
import { executeFunctionCall } from '../core/executeFunctionCall.js';

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

    case 'CallExpression': {
      const callNode = node as any; // Type as any or CallExpression if imported
      if (callNode.callee.type !== 'Identifier') {
        throw new TraceInterpreterError(
          `Unsupported function call format. Only direct function calls are supported.`,
          'UNSUPPORTED_FUNCTION_CALL'
        );
      }
      const calleeName = callNode.callee.name;

      const stackLen = env.state.callStack.length;
      const currentFunctionName = stackLen > 0 ? env.state.callStack[stackLen - 1]?.functionName : null;

      if (calleeName !== currentFunctionName) {
        throw new TraceInterpreterError(
          `Unsupported function call "${calleeName}". Only self-recursion is supported.`,
          'UNSUPPORTED_FUNCTION_CALL'
        );
      }

      const fnNode = env.functionRegistry.get(calleeName);
      if (!fnNode) {
        throw new TraceInterpreterError(
          `Function "${calleeName}" not found.`,
          'FUNCTION_NOT_FOUND'
        );
      }

      const args = callNode.arguments.map((arg: any) => evaluateExpression(arg, env, fnName));
      
      // Need to import executeFunctionCall, we'll do this in the next step
      return executeFunctionCall(fnNode, env, args) as RuntimeValue;
    }

    default:
      throw new TraceInterpreterError(
        `Unsupported expression type "${node.type}" in function "${fnName}".`,
        'UNSUPPORTED_EXPRESSION',
      );
  }
}


