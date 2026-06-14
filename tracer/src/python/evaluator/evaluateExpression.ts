import { PythonRuntimeValue, assertPythonArrayLength } from '../runtime/pythonRuntimeValues';
import { tokenizePythonExpression } from '../parser/parseExpressions';
import { PythonToken } from '../ast/pythonAstTypes';
import { createPythonError } from '../errors/createPythonError';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { evaluateBinaryOperation } from './evaluateBinaryExpression';

export type PythonFunctionCallHandler = (params: {
  functionName: string;
  args: PythonRuntimeValue[];
}) => PythonRuntimeValue;

export function evaluatePythonExpression(params: {
  expression: string;
  variables: Record<string, PythonRuntimeValue>;
  recorder?: StepRecorder;
  onFunctionCall?: PythonFunctionCallHandler;
}): PythonRuntimeValue {
  const { expression, variables, recorder, onFunctionCall } = params;
  const tokens = tokenizePythonExpression(expression);
  let current = 0;

  function peek(): PythonToken {
    return tokens[current]!;
  }

  function consume(): PythonToken {
    return tokens[current++]!;
  }

  function parsePrimary(): PythonRuntimeValue {
    const token = consume();
    if (token.type === 'number') return token.value;
    if (token.type === 'string') return token.value;
    if (token.type === 'boolean') return token.value;
    if (token.type === 'none') return null;
    if (token.type === 'identifier') {
      if (token.name === 'len') {
        const nextToken = peek();
        if (nextToken.type === 'lparen') {
          consume();
          const expr = parseComparison();
          const rparen = consume();
          if (rparen.type !== 'rparen') throw createPythonError('Expected )', PYTHON_ERROR_CODES.PARSE_ERROR);
          if (Array.isArray(expr)) return expr.length;
          if (typeof expr === 'string') return expr.length;
          throw createPythonError(`object has no len()`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
        }
      }
      const nextToken = peek();
      if (nextToken.type === 'lparen') {
        consume(); // consume '('
        const args: PythonRuntimeValue[] = [];
        if (peek().type !== 'rparen') {
          args.push(parseComparison());
          while (peek().type === 'comma') {
            consume();
            if (peek().type === 'rparen') break;
            args.push(parseComparison());
          }
        }
        const rparen = consume();
        if (rparen.type !== 'rparen') throw createPythonError('Expected )', PYTHON_ERROR_CODES.PARSE_ERROR);
        
        if (!onFunctionCall) {
          throw createPythonError(`Function calls are not supported`, PYTHON_ERROR_CODES.UNSUPPORTED_EXPRESSION);
        }
        return onFunctionCall({ functionName: token.name, args });
      }
      
      if (!(token.name in variables)) {
        throw createPythonError(`Unknown identifier: ${token.name}`, PYTHON_ERROR_CODES.UNSUPPORTED_EXPRESSION);
      }
      return variables[token.name] as PythonRuntimeValue;
    }
    if (token.type === 'operator' && token.op === '-') {
      const expr = parsePostfix();
      if (typeof expr !== 'number') {
        throw createPythonError(`Unsupported type for unary minus`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
      }
      return -expr;
    }
    if (token.type === 'lparen') {
      const expr = parseComparison();
      const rparen = consume();
      if (rparen.type !== 'rparen') throw createPythonError('Expected )', PYTHON_ERROR_CODES.PARSE_ERROR);
      return expr;
    }
    if (token.type === 'lbracket') {
      const list: PythonRuntimeValue[] = [];
      if (peek().type !== 'rbracket') {
        list.push(parseComparison());
        while (peek().type === 'comma') {
          consume();
          if (peek().type === 'rbracket') break; // trailing comma
          list.push(parseComparison());
        }
      }
      const rbracket = consume();
      if (rbracket.type !== 'rbracket') throw createPythonError('Expected ]', PYTHON_ERROR_CODES.PARSE_ERROR);
      assertPythonArrayLength(list.length);
      return list;
    }
    throw createPythonError(`Unexpected token: ${JSON.stringify(token)}`, PYTHON_ERROR_CODES.PARSE_ERROR);
  }

  function parsePostfix(): PythonRuntimeValue {
    let expr = parsePrimary();
    while (peek().type === 'lbracket') {
      consume(); // consume '['
      const indexExpr = parseComparison();
      const rbracket = consume();
      if (rbracket.type !== 'rbracket') throw createPythonError('Expected ]', PYTHON_ERROR_CODES.PARSE_ERROR);
      
      if (!Array.isArray(expr)) {
        throw createPythonError(`object is not subscriptable`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
      }
      if (typeof indexExpr !== 'number' || !Number.isInteger(indexExpr)) {
        throw createPythonError(`list indices must be integers`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
      }
      if (indexExpr < 0) {
        throw createPythonError(`Negative indexing is not supported in MVP`, PYTHON_ERROR_CODES.UNSUPPORTED_EXPRESSION);
      }
      if (indexExpr >= expr.length) {
        throw createPythonError(`list index out of range`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
      }
      
      if (recorder) {
        recorder.record({
          line: null,
          type: 'array_read',
          description: `Read index ${indexExpr} of list`
        });
      }
      
      expr = expr[indexExpr] as PythonRuntimeValue;
    }
    return expr;
  }

  function parseFactor(): PythonRuntimeValue {
    let left = parsePostfix();
    while (true) {
      const token = peek();
      if (token.type === 'operator' && (token.op === '*' || token.op === '/' || token.op === '//' || token.op === '%')) {
        consume();
        const right = parsePrimary();
        left = evaluateBinaryOperation(left, token.op, right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseExpression(): PythonRuntimeValue {
    let left = parseFactor();
    while (true) {
      const token = peek();
      if (token.type === 'operator' && (token.op === '+' || token.op === '-')) {
        consume();
        const right = parseFactor();
        left = evaluateBinaryOperation(left, token.op, right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseComparison(): PythonRuntimeValue {
    let left = parseExpression();
    while (true) {
      const token = peek();
      if (token.type === 'operator' && (['<', '<=', '>', '>=', '==', '!='].includes(token.op))) {
        consume();
        const right = parseExpression();
        left = evaluateBinaryOperation(left, token.op, right);
      } else {
        break;
      }
    }
    return left;
  }

  const result = parseComparison();
  if (peek().type !== 'eof') {
    throw createPythonError(`Unexpected trailing tokens`, PYTHON_ERROR_CODES.PARSE_ERROR);
  }
  return result;
}
