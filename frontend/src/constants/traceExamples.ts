export type TraceExampleCategory =
  | 'all'
  | 'basics'
  | 'branches'
  | 'loops'
  | 'arrays'
  | 'recursion';

export type TraceExample = {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'loops' | 'arrays' | 'recursion' | 'branches';
  language: 'javascript';
  sourceCode: string;
  entryFunction: string;
  input: unknown[];
  expectedResult?: unknown;
  learningPoints?: string[];
};

export const TRACE_EXAMPLES: TraceExample[] = [
  {
    id: 'basic-add',
    title: 'Basic Add',
    description: 'A simple function that adds two numbers.',
    category: 'basics',
    language: 'javascript',
    sourceCode: `function add(a, b) {
  return a + b;
}`,
    entryFunction: 'add',
    input: [2, 3],
    expectedResult: 5,
    learningPoints: [
      'Function parameters',
      'Return statement',
      'Basic arithmetic'
    ],
  },
  {
    id: 'if-else-check',
    title: 'If Else Check',
    description: 'A basic branch that returns different strings based on the input.',
    category: 'branches',
    language: 'javascript',
    sourceCode: `function checkNumber(n) {
  if (n > 0) {
    return "positive";
  }

  return "not positive";
}`,
    entryFunction: 'checkNumber',
    input: [5],
    expectedResult: "positive",
    learningPoints: [
      'Condition evaluation',
      'Branch selection',
      'Return flow'
    ],
  },
  {
    id: 'array-sum-for',
    title: 'Array Sum With For Loop',
    description: 'Iterates through an array using a for loop to calculate the sum.',
    category: 'loops',
    language: 'javascript',
    sourceCode: `function sum(arr) {
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    total = total + arr[i];
  }

  return total;
}`,
    entryFunction: 'sum',
    input: [[2, 4, 6]],
    expectedResult: 12,
    learningPoints: [
      'For loop iterations',
      'Array index reads',
      'Accumulator variable changes'
    ],
  },
  {
    id: 'array-sum-while',
    title: 'Array Sum With While Loop',
    description: 'Iterates through an array using a while loop to calculate the sum.',
    category: 'loops',
    language: 'javascript',
    sourceCode: `function sumWhile(arr) {
  let total = 0;
  let i = 0;

  while (i < arr.length) {
    total = total + arr[i];
    i++;
  }

  return total;
}`,
    entryFunction: 'sumWhile',
    input: [[2, 4, 6]],
    expectedResult: 12,
    learningPoints: [
      'While loop condition checks',
      'Manual index update',
      'Accumulator variable changes'
    ],
  },
  {
    id: 'factorial-recursion',
    title: 'Factorial Recursion',
    description: 'Calculates the factorial of a number using simple self-recursion.',
    category: 'recursion',
    language: 'javascript',
    sourceCode: `function factorial(n) {
  if (n === 0) {
    return 1;
  }

  return n * factorial(n - 1);
}`,
    entryFunction: 'factorial',
    input: [4],
    expectedResult: 24,
    learningPoints: [
      'Recursive calls',
      'Base case',
      'Call stack growth',
      'Recursion unwinding'
    ],
  }
];
