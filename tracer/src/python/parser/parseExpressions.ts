import { PythonToken } from '../ast/pythonAstTypes';

export function tokenizePythonExpression(expr: string): PythonToken[] {
  const tokens: PythonToken[] = [];
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i]!;
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (char === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (char === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
    if (char === '[') { tokens.push({ type: 'lbracket' }); i++; continue; }
    if (char === ']') { tokens.push({ type: 'rbracket' }); i++; continue; }
    if (char === ',') { tokens.push({ type: 'comma' }); i++; continue; }
    
    // Operators
    if (char === '=' && expr[i+1] === '=') { tokens.push({ type: 'operator', op: '==' }); i += 2; continue; }
    if (char === '!' && expr[i+1] === '=') { tokens.push({ type: 'operator', op: '!=' }); i += 2; continue; }
    if (char === '<' && expr[i+1] === '=') { tokens.push({ type: 'operator', op: '<=' }); i += 2; continue; }
    if (char === '>' && expr[i+1] === '=') { tokens.push({ type: 'operator', op: '>=' }); i += 2; continue; }
    if (char === '<') { tokens.push({ type: 'operator', op: '<' }); i++; continue; }
    if (char === '>') { tokens.push({ type: 'operator', op: '>' }); i++; continue; }

    if (char === '+' || char === '-' || char === '*' || char === '%' || char === '/') {
      if (char === '/' && expr[i+1] === '/') {
        tokens.push({ type: 'operator', op: '//' });
        i += 2;
      } else {
        tokens.push({ type: 'operator', op: char });
        i++;
      }
      continue;
    }
    
    // Number
    if (/[0-9]/.test(char)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i]!)) {
        numStr += expr[i]!;
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
      continue;
    }
    
    // String
    if (char === '"' || char === "'") {
      const quote = char;
      let str = '';
      i++;
      while (i < expr.length && expr[i] !== quote) {
        str += expr[i]!;
        i++;
      }
      if (expr[i] !== quote) throw new Error("Unterminated string");
      i++;
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Identifiers & literals
    if (/[A-Za-z_]/.test(char)) {
      let id = '';
      while (i < expr.length && /[A-Za-z0-9_]/.test(expr[i]!)) {
        id += expr[i]!;
        i++;
      }
      if (id === 'True') tokens.push({ type: 'boolean', value: true });
      else if (id === 'False') tokens.push({ type: 'boolean', value: false });
      else if (id === 'None') tokens.push({ type: 'none', value: null });
      else tokens.push({ type: 'identifier', name: id });
      continue;
    }
    
    throw new Error(`Unexpected token at index ${i}: ${char}`);
  }
  
  tokens.push({ type: 'eof' });
  return tokens;
}
