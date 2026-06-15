import { TraceInterpreterError } from '../errors/javaErrors';
import { RuntimeValue } from '../../types/interpreter';
import { tokenizeJavaExpression } from '../parser/parseExpressions';
import { assertNumberValue } from '../runtime/javaRuntimeValues';

import { createJavaArrayValue, JavaArrayElementType } from '../runtime/javaRuntimeValues';

export type JavaMethodCallHandler = (params: {
  methodName: string;
  args: RuntimeValue[];
}) => RuntimeValue;

export function evaluateJavaExpression(params: {
  expression: string;
  variables: Map<string, RuntimeValue>;
  onArrayRead?: (name: string, index: number, value: RuntimeValue) => void;
  onMethodCall?: JavaMethodCallHandler;
}): RuntimeValue {
  const { expression, variables } = params;
  const tokens = tokenizeJavaExpression(expression);
  let pos = 0;

  function parsePrimary(): RuntimeValue {
    if (pos >= tokens.length) throw new TraceInterpreterError('JAVA_UNSUPPORTED_EXPRESSION: Unexpected end of expression');
    const token = tokens[pos++] as any;
    if (token.type === 'number') return parseFloat(token.value);
    if (token.type === 'string') return token.value;
    if (token.type === 'boolean') return token.value === 'true';
    if (token.type === 'null') return null;
    
    if (token.type === 'lbrace') {
      const items: RuntimeValue[] = [];
      if (pos < tokens.length && (tokens[pos] as any).type === 'rbrace') {
         pos++;
      } else {
         while (true) {
            items.push(parseExpression());
            if (pos >= tokens.length) throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected }');
            if ((tokens[pos] as any).type === 'rbrace') {
               pos++; break;
            }
            if ((tokens[pos] as any).type === 'comma') {
               pos++;
            } else {
               throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected comma or }');
            }
         }
      }
      const elementType = items.length > 0 ? (typeof items[0] === 'number' ? 'int' : typeof items[0] === 'string' ? 'String' : typeof items[0] === 'boolean' ? 'boolean' : 'array') : 'int';
      return createJavaArrayValue(elementType as JavaArrayElementType, items as any) as any;
    }

    if (token.type === 'identifier') {
      let name = token.value;

      if (pos < tokens.length && (tokens[pos] as any).type === 'lparen') {
        pos++;
        const args: RuntimeValue[] = [];
        if (pos < tokens.length && (tokens[pos] as any).type === 'rparen') {
          pos++;
        } else {
          while (true) {
            args.push(parseExpression());
            if (pos >= tokens.length) throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected )');
            if ((tokens[pos] as any).type === 'rparen') {
              pos++;
              break;
            }
            if ((tokens[pos] as any).type === 'comma') {
              pos++;
            } else {
              throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected comma or )');
            }
          }
        }
        if (params.onMethodCall) {
          return params.onMethodCall({ methodName: name, args });
        } else {
          throw new TraceInterpreterError('JAVA_METHOD_CALL_UNSUPPORTED: Method calls are not supported');
        }
      }

      if (!variables.has(name)) {
        throw new TraceInterpreterError('JAVA_VARIABLE_NOT_FOUND: ' + name + ' is not defined');
      }
      let value = variables.get(name) as any;

      while (pos < tokens.length) {
        if ((tokens[pos] as any).type === 'lbracket') {
          pos++;
          const indexExpr = parseExpression();
          if (pos >= tokens.length || (tokens[pos] as any).type !== 'rbracket') {
             throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected ]');
          }
          pos++;
          const index = assertNumberValue(indexExpr as any);
          if (!Number.isInteger(index) || index < 0) {
             throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Array index must be positive integer');
          }
          if (!value || typeof value !== 'object' || value.type !== 'array') {
             throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Cannot index non-array value');
          }
          if (index >= value.value.length) {
             throw new TraceInterpreterError('JAVA_RUNTIME_LIMIT_EXCEEDED: Array index out of bounds');
          }
          const itemValue = value.value[index];
          if (params.onArrayRead) {
             params.onArrayRead(name, index, itemValue);
          }
          value = itemValue;
          name = name + '[' + index + ']';
        } else if ((tokens[pos] as any).type === 'dot') {
          pos++;
          const propToken = tokens[pos++] as any;
          if (propToken?.type !== 'identifier' || propToken.value !== 'length') {
             throw new TraceInterpreterError('JAVA_UNSUPPORTED_EXPRESSION: Unsupported property access');
          }
          if (!value || typeof value !== 'object' || value.type !== 'array') {
             throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: .length only applies to arrays');
          }
          value = value.value.length;
          break;
        } else {
          break;
        }
      }
      return value;
    }

    if (token.type === 'lparen') {
      const value = parseExpression();
      if (pos >= tokens.length || (tokens[pos] as any).type !== 'rparen') {
        throw new TraceInterpreterError('JAVA_UNSUPPORTED_EXPRESSION: Missing closing parenthesis');
      }
      pos++;
      return value;
    }
    throw new TraceInterpreterError("JAVA_UNSUPPORTED_EXPRESSION: Unexpected token '" + token.value + "'");
  }

  function parseUnary(): RuntimeValue {
    if (pos < tokens.length && (tokens[pos] as any).type === 'operator' && (tokens[pos] as any).value === '!') {
      pos++;
      const right = parseUnary();
      if (typeof right !== 'boolean') {
        throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Operator ! requires boolean operand');
      }
      return !right;
    }
    if (pos < tokens.length && (tokens[pos] as any).type === 'operator' && (tokens[pos] as any).value === '-') {
      pos++;
      const right = parseUnary();
      if (typeof right !== 'number') {
        throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Operator - requires numeric operand');
      }
      return -right;
    }
    return parsePrimary();
  }

  function parseMultiplicative(): RuntimeValue {
    let left = parseUnary();
    while (pos < tokens.length && (tokens[pos] as any).type === 'operator' && ['*', '/', '%'].includes((tokens[pos] as any).value)) {
      const op = (tokens[pos++] as any).value;
      const right = parseUnary();
      left = assertNumberValue(left as any);
      const rNum = assertNumberValue(right as any);
      if (op === '*') left = (left as number) * rNum;
      else if (op === '/') left = (left as number) / rNum;
      else if (op === '%') left = (left as number) % rNum;
    }
    return left;
  }

  function parseAdditive(): RuntimeValue {
    let left = parseMultiplicative();
    while (pos < tokens.length && (tokens[pos] as any).type === 'operator' && ['+', '-'].includes((tokens[pos] as any).value)) {
      const op = (tokens[pos++] as any).value;
      const right = parseMultiplicative();
      if (op === '+') {
        if (typeof left === 'string' || typeof right === 'string') {
          left = String(left) + String(right);
        } else {
          left = (assertNumberValue(left as any) as number) + (assertNumberValue(right as any) as number);
        }
      } else if (op === '-') {
        left = (assertNumberValue(left as any) as number) - (assertNumberValue(right as any) as number);
      }
    }
    return left;
  }

  function parseRelational(): RuntimeValue {
    let left = parseAdditive();
    while (pos < tokens.length && (tokens[pos] as any).type === 'operator' && ['<', '<=', '>', '>='].includes((tokens[pos] as any).value)) {
      const op = (tokens[pos++] as any).value;
      const right = parseAdditive();
      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Relational operators require numeric operands');
      }
      if (op === '<') left = (left as number) < (right as number);
      else if (op === '<=') left = (left as number) <= (right as number);
      else if (op === '>') left = (left as number) > (right as number);
      else if (op === '>=') left = (left as number) >= (right as number);
    }
    return left;
  }

  function parseEquality(): RuntimeValue {
    let left = parseRelational();
    while (pos < tokens.length && (tokens[pos] as any).type === 'operator' && ['==', '!='].includes((tokens[pos] as any).value)) {
      const op = (tokens[pos++] as any).value;
      const right = parseRelational();
      if (typeof left !== typeof right && left !== null && right !== null) {
        throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Cannot compare ' + typeof left + ' to ' + typeof right);
      }
      if (op === '==') left = left === right;
      else if (op === '!=') left = left !== right;
    }
    return left;
  }

  function parseLogicalAnd(): RuntimeValue {
    let left = parseEquality();
    while (pos < tokens.length && (tokens[pos] as any).type === 'operator' && (tokens[pos] as any).value === '&&') {
      pos++;
      const right = parseEquality();
      if (typeof left !== 'boolean' || typeof right !== 'boolean') {
        throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Operator && requires boolean operands');
      }
      left = left && right;
    }
    return left;
  }

  function parseLogicalOr(): RuntimeValue {
    let left = parseLogicalAnd();
    while (pos < tokens.length && (tokens[pos] as any).type === 'operator' && (tokens[pos] as any).value === '||') {
      pos++;
      const right = parseLogicalAnd();
      if (typeof left !== 'boolean' || typeof right !== 'boolean') {
        throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Operator || requires boolean operands');
      }
      left = left || right;
    }
    return left;
  }

  function parseExpression(): RuntimeValue {
    return parseLogicalOr();
  }

  const result = parseExpression();
  if (pos < tokens.length) {
     throw new TraceInterpreterError("JAVA_UNSUPPORTED_EXPRESSION: Unexpected token '" + (tokens[pos] as any).value + "'");
  }
  return result;
}
