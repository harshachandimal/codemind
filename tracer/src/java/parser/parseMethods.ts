import { assertJavaSupportedSyntax } from '../utils/javaUnsupportedNodes';
import { TraceInterpreterError } from '../errors/javaErrors';

export type JavaParameterDefinition = {
  typeName: 'int' | 'double' | 'boolean' | 'String' | 'int[]' | 'double[]' | 'boolean[]' | 'String[]' | 'int[][]' | 'double[][]' | 'boolean[][]' | 'String[][]';
  name: string;
};

export type JavaMethodDefinition = {
  returnType: 'int' | 'double' | 'boolean' | 'String' | 'void' | 'int[]' | 'double[]' | 'boolean[]' | 'String[]' | 'int[][]' | 'double[][]' | 'boolean[][]' | 'String[][]';
  name: string;
  params: JavaParameterDefinition[];
  bodyText: string;
  startLine: number;
};

export function parseJavaMethods(sourceCode: string): JavaMethodDefinition[] {
  const methods: JavaMethodDefinition[] = [];
  const regex = /(?:public\s+|private\s+|protected\s+)?static\s+((?:int|double|boolean|String|void)(?:\[\]){0,2})\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
  let match;
  while ((match = regex.exec(sourceCode)) !== null) {
    const returnType = match[1] as any;
    const name = match[2] || '';
    const paramStr = match[3] || '';
    
    const params: JavaParameterDefinition[] = paramStr.split(',').map(p => p.trim()).filter(Boolean).map(p => {
      const parts = p.split(/\s+/);
      return { typeName: parts[0] as any, name: parts[1] || '' };
    });

    let i = match.index + match[0].length;
    let body = '';

    let startLine = 1;
    for (let k = 0; k < i; k++) {
      if (sourceCode[k] === '\n') startLine++;
    }

    let depth = 1;
    while (i < sourceCode.length && depth > 0) {
      if (sourceCode[i] === '{') depth++;
      else if (sourceCode[i] === '}') depth--;
      if (depth > 0) body += sourceCode[i];
      i++;
    }

    if (depth !== 0) {
      throw new TraceInterpreterError('JAVA_PARSE_ERROR: Unbalanced braces in method body');
    }

    if (body.includes('public ') || body.includes('static ')) {
      throw new TraceInterpreterError('JAVA_PARSE_ERROR: Nested methods are not supported');
    }

    const cleanBody = body
      .replace(/\/\/.*$/gm, m => ' '.repeat(m.length))
      .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

    methods.push({ returnType, name, params, bodyText: cleanBody, startLine });
  }

  return methods;
}
