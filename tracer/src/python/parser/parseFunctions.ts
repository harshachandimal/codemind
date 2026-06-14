import { parsePythonSource } from '../ast/parsePythonSource';
import { PythonStatement } from '../ast/pythonAstTypes';
import { parsePythonStatements } from './parseStatements';

export type PythonFunctionDefinition = {
  name: string;
  params: string[];
  body: PythonStatement[];
};

export function parsePythonFunctions(sourceCode: string): PythonFunctionDefinition[] {
  const parseResult = parsePythonSource(sourceCode);
  if (parseResult.hasSyntaxError) {
    throw new Error('Syntax error in Python source code.');
  }

  const lines = sourceCode.split('\n');
  const functions: PythonFunctionDefinition[] = [];
  
  let currentFunc: PythonFunctionDefinition | null = null;
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]!;
    const trimmed = rawLine.trim();

    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }

    const indentMatch = rawLine.match(/^(\s*)/);
    const indentLevel = indentMatch ? indentMatch[1]!.length : 0;

    const defMatch = trimmed.match(/^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*:/);
    if (defMatch) {
      if (currentFunc !== null && indentLevel > 0) {
        throw new Error('Nested functions are not supported.');
      }
      
      // Before starting a new function, parse the old one's body
      if (currentFunc) {
        currentFunc.body = parsePythonStatements((currentFunc as any)._rawBodyLines, currentIndent + 4); // assume 4 spaces or we can calculate it inside parser
        functions.push(currentFunc);
      }

      const name = defMatch[1]!;
      const paramsStr = defMatch[2]!.trim();
      const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];
      currentFunc = { name, params, body: [] };
      (currentFunc as any)._rawBodyLines = [];
      currentIndent = indentLevel;
      continue;
    }

    if (currentFunc) {
      if (indentLevel <= currentIndent && trimmed !== '') {
        // Function ended naturally
        currentFunc.body = parsePythonStatements((currentFunc as any)._rawBodyLines, getIndent((currentFunc as any)._rawBodyLines.find((l: string) => l.trim() !== '') || '    '));
        functions.push(currentFunc);
        currentFunc = null;
      } else {
        (currentFunc as any)._rawBodyLines.push(rawLine);
      }
    }
  }

  if (currentFunc) {
    currentFunc.body = parsePythonStatements((currentFunc as any)._rawBodyLines, getIndent((currentFunc as any)._rawBodyLines.find((l: string) => l.trim() !== '') || '    '));
    functions.push(currentFunc);
  }

  function getIndent(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? match[1]!.length : 0;
  }

  return functions;
}
