export type JavaToken = 
  | { type: 'number' | 'string' | 'identifier' | 'operator' | 'boolean' | 'null' | 'lparen' | 'rparen' | 'lbracket' | 'rbracket' | 'dot' | 'lbrace' | 'rbrace' | 'comma'; value: string; };

export function tokenizeJavaExpression(expr: string): JavaToken[] {
  const tokens: JavaToken[] = [];
  let i = 0;
  while (i < expr.length) {
    const twoChar = expr.substring(i, i + 2);
    if (['<=', '>=', '==', '!=', '&&', '||'].includes(twoChar)) {
      tokens.push({ type: 'operator', value: twoChar });
      i += 2;
      continue;
    }
    
    const char = expr[i] as string;
    if (/\s/.test(char)) { i++; continue; }
    if (char === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (char === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (char === '[') { tokens.push({ type: 'lbracket', value: '[' }); i++; continue; }
    if (char === ']') { tokens.push({ type: 'rbracket', value: ']' }); i++; continue; }
    if (char === '.') { tokens.push({ type: 'dot', value: '.' }); i++; continue; }
    if (char === '{') { tokens.push({ type: 'lbrace', value: '{' }); i++; continue; }
    if (char === '}') { tokens.push({ type: 'rbrace', value: '}' }); i++; continue; }
    if (char === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }
    if (/[\+\-\*\/%<>!]/.test(char)) { tokens.push({ type: 'operator', value: char }); i++; continue; }
    if (char === '"') {
      let str = '';
      i++;
      while (i < expr.length && (expr[i] as string) !== '"') { str += (expr[i++] as string); }
      i++;
      tokens.push({ type: 'string', value: str });
      continue;
    }
    if (/\d/.test(char)) {
      let num = '';
      while (i < expr.length && /[\d\.]/.test(expr[i] as string)) { num += (expr[i++] as string); }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    if (/[a-zA-Z_]/.test(char)) {
      let id = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i] as string)) { id += (expr[i++] as string); }
      if (id === 'true' || id === 'false') {
        tokens.push({ type: 'boolean', value: id });
      } else if (id === 'null') {
        tokens.push({ type: 'null', value: 'null' });
      } else {
        tokens.push({ type: 'identifier', value: id });
      }
      continue;
    }
    throw new Error("JAVA_UNSUPPORTED_EXPRESSION: Unexpected character '" + char + "'");
  }
  return tokens;
}
