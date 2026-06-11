import type { Program, FunctionDeclaration } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';

export function findEntryFunction(program: Program, entryName: string | null): FunctionDeclaration {
  let targetFn: FunctionDeclaration | null = null;

  for (const node of program.body) {
    if (node.type === 'FunctionDeclaration' && node.id != null) {
      if (entryName === null || node.id.name === entryName) {
        targetFn = node as FunctionDeclaration;
        break;
      }
    }
  }

  if (targetFn === null) {
    const sought = entryName ?? '(first function)';
    throw new TraceInterpreterError(
      `Function "${sought}" not found in source.`,
      'FUNCTION_NOT_FOUND',
    );
  }

  return targetFn;
}


