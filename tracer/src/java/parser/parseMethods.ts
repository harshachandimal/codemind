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

    let depth = 1;
    let i = match.index + match[0].length;
    let body = '';
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

    const cleanBody = body.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

    methods.push({ returnType, name, params, bodyText: cleanBody });
  }

  return methods;
}
