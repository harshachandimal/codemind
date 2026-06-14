import { parser } from '@lezer/python';
import { TRACE_LIMITS } from '../../config/traceLimits';

export type PythonParseSummary = {
  language: 'python';
  hasSyntaxError: boolean;
  nodeCount: number;
  topLevelFunctionNames: string[];
  detectedNodeTypes: string[];
};

export function parsePythonSource(sourceCode: string): PythonParseSummary {
  if (typeof sourceCode !== 'string') {
    throw new Error('Source code must be a string.');
  }

  if (sourceCode.length > TRACE_LIMITS.maxSourceLength) {
    throw new Error(`Source code exceeds maximum length of ${TRACE_LIMITS.maxSourceLength} characters.`);
  }

  let hasSyntaxError = false;
  let nodeCount = 0;
  const detectedNodeTypeSet = new Set<string>();

  // Extract function names safely via regex without executing
  const topLevelFunctionNames: string[] = [];
  const regex = /^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm;
  let match;
  while ((match = regex.exec(sourceCode)) !== null) {
    if (match[1]) {
      topLevelFunctionNames.push(match[1]);
    }
  }

  // Parse source text
  const tree = parser.parse(sourceCode);
  const cursor = tree.cursor();

  do {
    nodeCount++;
    detectedNodeTypeSet.add(cursor.name);
    if (cursor.type.isError || cursor.name === '⚠' || cursor.name === 'Error') {
      hasSyntaxError = true;
    }
  } while (cursor.next());

  return {
    language: 'python',
    hasSyntaxError,
    nodeCount,
    topLevelFunctionNames,
    detectedNodeTypes: Array.from(detectedNodeTypeSet),
  };
}
