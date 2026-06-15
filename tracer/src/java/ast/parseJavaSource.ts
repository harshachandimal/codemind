import { TRACE_LIMITS } from '../../config/traceLimits';

export type JavaParseSummary = {
  language: 'java';
  hasSyntaxError: boolean;
  classNames: string[];
  staticMethodNames: string[];
  detectedStructures: string[];
  braceBalanced: boolean;
  parenthesisBalanced: boolean;
};

function stripJavaComments(sourceCode: string): string {
  // Replace // comments
  let stripped = sourceCode.replace(/\/\/.*$/gm, '');
  // Replace /* */ block comments
  stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
  return stripped;
}

function hasBalancedBraces(sourceCode: string): boolean {
  let depth = 0;
  for (const char of sourceCode) {
    if (char === '{') depth++;
    if (char === '}') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function hasBalancedParentheses(sourceCode: string): boolean {
  let depth = 0;
  for (const char of sourceCode) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function extractClassNames(sourceCode: string): string[] {
  const classNames: string[] = [];
  const regex = /(?:public\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
  let match;
  while ((match = regex.exec(sourceCode)) !== null) {
    if (match[1]) classNames.push(match[1]);
  }
  return classNames;
}

function extractStaticMethodNames(sourceCode: string): string[] {
  const methodNames: string[] = [];
  // Match public static <type> <name>(...) or static <type> <name>(...)
  const regex = /(?:public\s+)?static\s+[A-Za-z0-9_<>\[\]]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let match;
  while ((match = regex.exec(sourceCode)) !== null) {
    if (match[1]) methodNames.push(match[1]);
  }
  return methodNames;
}

function detectJavaStructures(sourceCode: string, methodNames: string[]): string[] {
  const structures = new Set<string>();
  
  if (/\bif\s*\(/.test(sourceCode)) structures.add('if');
  if (/\belse\s*\{?/.test(sourceCode)) structures.add('else');
  if (/\bfor\s*\(/.test(sourceCode)) structures.add('for');
  if (/\bwhile\s*\(/.test(sourceCode)) structures.add('while');
  if (/\breturn\b/.test(sourceCode)) structures.add('return');
  
  if (/\b(?:int|double|boolean|String)\s+[A-Za-z_][A-Za-z0-9_]*\s*=/.test(sourceCode)) {
    structures.add('variable_declaration');
  }
  
  if (/\b[A-Za-z_][A-Za-z0-9_]*\s*(?:\+|-|\*|\/|%)?=\s*[^=]/.test(sourceCode)) {
    structures.add('assignment');
  }
  
  if (/\[\s*[a-zA-Z0-9_+*-]+\s*\]/.test(sourceCode)) {
    structures.add('array_usage');
  }

  for (const method of methodNames) {
    const callRegex = new RegExp(`\\b${method}\\s*\\(`, 'g');
    const matches = sourceCode.match(callRegex);
    if (matches && matches.length > 1) {
      structures.add('recursion_candidate');
    }
  }

  return Array.from(structures);
}

export function parseJavaSource(sourceCode: string): JavaParseSummary {
  if (typeof sourceCode !== 'string') {
    throw new Error('sourceCode must be a string');
  }

  if (sourceCode.length > TRACE_LIMITS.maxSourceLength) {
    throw new Error('Source code exceeds maximum length allowed.');
  }

  const cleanCode = stripJavaComments(sourceCode);
  const braceBalanced = hasBalancedBraces(cleanCode);
  const parenthesisBalanced = hasBalancedParentheses(cleanCode);
  const classNames = extractClassNames(cleanCode);
  const staticMethodNames = extractStaticMethodNames(cleanCode);
  const detectedStructures = detectJavaStructures(cleanCode, staticMethodNames);

  let hasSyntaxError = false;
  if (!braceBalanced || !parenthesisBalanced || classNames.length === 0 || staticMethodNames.length === 0) {
    hasSyntaxError = true;
  }

  return {
    language: 'java',
    hasSyntaxError,
    classNames,
    staticMethodNames,
    detectedStructures,
    braceBalanced,
    parenthesisBalanced,
  };
}
