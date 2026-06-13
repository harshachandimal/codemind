import type { TraceStep } from '../types/analysis';

export type RecursionTreeNode = {
  id: string;
  functionName: string;
  depth: number;
  firstStep: number;
  lastStep: number;
  returnedDescription?: string;
};

export function buildRecursionTreeFromSteps(
  steps: TraceStep[] | null | undefined
): RecursionTreeNode[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  const nodes: RecursionTreeNode[] = [];
  const activeCallStack: { node: RecursionTreeNode; depth: number }[] = [];

  for (const step of steps) {
    if (step.type === 'function_call') {
      const callStack = step.callStack || [];
      const depth = Math.max(0, callStack.length - 1);
      const functionName = callStack.length > 0 
        ? callStack[callStack.length - 1] 
        : (step.description.match(/Calling function "([^"]+)"/) || [])[1] || 'unknown';

      const node: RecursionTreeNode = {
        id: `call_${step.step}_${depth}`,
        functionName,
        depth,
        firstStep: step.step,
        lastStep: step.step,
      };

      nodes.push(node);
      activeCallStack.push({ node, depth });
    } else if (step.type === 'return') {
      // Find the deepest matching function in the active call stack
      const callStack = step.callStack || [];
      const depth = Math.max(0, callStack.length - 1);
      
      for (let i = activeCallStack.length - 1; i >= 0; i--) {
        if (activeCallStack[i].depth === depth) {
          activeCallStack[i].node.lastStep = step.step;
          activeCallStack[i].node.returnedDescription = step.description;
          activeCallStack.splice(i, 1);
          break;
        }
      }
    }
  }

  return nodes;
}

export type RecursionUnwindStep = {
  id: string;
  step: number;
  functionName: string;
  depth: number;
  description: string;
  returnedValueLabel?: string;
};

export function buildRecursionUnwindSteps(
  steps: TraceStep[] | null | undefined
): RecursionUnwindStep[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  const unwindSteps: RecursionUnwindStep[] = [];

  for (const step of steps) {
    if (step.type !== 'return') continue;

    const callStack = step.callStack || [];
    if (callStack.length === 0) continue;

    const depth = Math.max(0, callStack.length - 1);
    const functionName = callStack[callStack.length - 1];

    // Light parsing: try to extract returned value from description
    // e.g. "Returned 24" or "Return: 24"
    const valueMatch = step.description.match(/[Rr]eturned?\s*[:\s]\s*(.+)/);
    const returnedValueLabel = valueMatch ? valueMatch[1].trim() : undefined;

    unwindSteps.push({
      id: `unwind_${step.step}_${depth}`,
      step: step.step,
      functionName,
      depth,
      description: step.description,
      returnedValueLabel,
    });
  }

  return unwindSteps;
}
