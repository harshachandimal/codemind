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
  language: 'javascript' | 'python' | 'java';
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
  },
  {
    id: 'nested-for-loop-pairs',
    title: 'Nested For Loop',
    description: 'Shows how nested loops multiply the number of iterations, producing O(n²) work.',
    category: 'loops',
    language: 'javascript',
    sourceCode: `function countPairs(n) {
  let count = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      count = count + 1;
    }
  }

  return count;
}`,
    entryFunction: 'countPairs',
    input: [3],
    expectedResult: 9,
    learningPoints: [
      'Outer loop runs n times',
      'Inner loop runs n times for each outer iteration',
      'Total work grows as n × n',
      'Static complexity estimate is O(n²)',
      'Runtime returned value for n = 3 is 9',
    ],
  },
  {
    id: 'mixed-for-while-nested',
    title: 'Mixed For While Loop',
    description: 'A for loop containing a while loop — still O(n²) because both loops scale with n.',
    category: 'loops',
    language: 'javascript',
    sourceCode: `function mixed(n) {
  let count = 0;

  for (let i = 0; i < n; i++) {
    let j = 0;

    while (j < n) {
      count = count + 1;
      j++;
    }
  }

  return count;
}`,
    entryFunction: 'mixed',
    input: [2],
    expectedResult: 4,
    learningPoints: [
      'for and while loops can be nested together',
      'The outer for loop runs n times',
      'The inner while loop runs n times per outer iteration',
      'Total work is still n × n, so complexity is O(n²)',
      'Runtime returned value for n = 2 is 4',
    ],
  },
  {
    id: 'python-linear-loop',
    title: 'Python Linear Loop',
    description: 'A Python for loop that runs n times.',
    category: 'loops',
    language: 'python',
    sourceCode: `def total(n):
    result = 0
    for i in range(n):
        result += i
    return result`,
    entryFunction: 'total',
    input: [5],
    expectedResult: 10,
    learningPoints: [
      'The loop runs n times.',
      'Static time complexity is O(n).',
      'Python runtime tracing is experimental and may be disabled depending on server settings.'
    ],
  },
  {
    id: 'python-nested-loop',
    title: 'Python Nested Loop',
    description: 'Shows how nested loops multiply the number of iterations, producing O(n²) work.',
    category: 'loops',
    language: 'python',
    sourceCode: `def count_pairs(n):
    count = 0
    for i in range(n):
        for j in range(n):
            count += 1
    return count`,
    entryFunction: 'count_pairs',
    input: [3],
    expectedResult: 9,
    learningPoints: [
      'Outer loop runs n times.',
      'Inner loop runs n times for each outer iteration.',
      'Total work is n × n.',
      'Static complexity is O(n²).'
    ],
  },
  {
    id: 'python-recursion',
    title: 'Python Recursion',
    description: 'Calculates the factorial of a number using simple self-recursion.',
    category: 'recursion',
    language: 'python',
    sourceCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    entryFunction: 'factorial',
    input: [4],
    expectedResult: 24,
    learningPoints: [
      'The function calls itself.',
      'Static analyzer detects recursion.',
      'Runtime tracing for Python is not available yet.'
    ],
  },
  {
    id: 'java-linear-loop',
    title: 'Java Linear Loop',
    description: 'A Java for loop that runs n times.',
    category: 'loops',
    language: 'java',
    sourceCode: `public class Main {
    public static int total(int n) {
        int result = 0;
        for (int i = 0; i < n; i++) {
            result += i;
        }
        return result;
    }
}`,
    entryFunction: 'total',
    input: [5],
    expectedResult: 10,
    learningPoints: [
      'The for loop runs n times.',
      'Static complexity is O(n).',
      'Python runtime tracing is experimental and may be disabled depending on server settings.'
    ],
  },
  {
    id: 'java-nested-loop',
    title: 'Java Nested Loop',
    description: 'Shows how nested loops multiply the number of iterations, producing O(n²) work.',
    category: 'loops',
    language: 'java',
    sourceCode: `public class Main {
    public static int countPairs(int n) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                count++;
            }
        }
        return count;
    }
}`,
    entryFunction: 'countPairs',
    input: [3],
    expectedResult: 9,
    learningPoints: [
      'Nested loops multiply work.',
      'Static complexity is O(n²).',
      'Java runtime tracing is not available yet.'
    ],
  },
  {
    id: 'java-recursion',
    title: 'Java Recursion',
    description: 'Calculates the factorial of a number using simple self-recursion.',
    category: 'recursion',
    language: 'java',
    sourceCode: `public class Main {
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
}`,
    entryFunction: 'factorial',
    input: [4],
    expectedResult: 24,
    learningPoints: [
      'The method calls itself.',
      'Static analyzer detects recursion.',
      'Runtime tracing for Java is not available yet.'
    ],
  },
];

