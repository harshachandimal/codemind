export const SUPPORTED_TRACE_SYNTAX = [
  'function declarations',
  'entry function calls',
  'number, string, boolean, null values',
  'function parameters',
  'let/const variable declarations with initial values',
  'simple assignments using =',
  'return statements',
  'basic arithmetic (+, -, *, /, %)',
  'comparisons (<, <=, >, >=, ===, !==)',
  'simple if/else blocks',
  'simple for loops (for (let i = 0; i < n; i++))',
  'simple while loops',
  'nested for loops (for inside for)',
  'nested while loops (while inside while)',
  'mixed nested loops (for inside while, while inside for)',
  'while conditions using comparisons',
  'strict loop limit protection (maxLoopIterations)',
  'max loop depth protection (maxLoopDepth)',
  'max step protection (maxSteps)',
  'array input values',
  'array index reads (arr[i])',
  'array length reads (arr.length)',
  'nested array reads (matrix[i][j], matrix[i].length)',
  'simple self-recursion',
  'recursive base cases',
  'call stack tracing',
  'max call depth protection',
];


export const UNSUPPORTED_TRACE_SYNTAX = [
  'imports / exports',
  'require',
  'eval',
  'Function constructor',
  'fetch / network calls',
  'DOM APIs like window/document',
  'classes',
  'async/await',
  'promises',
  'arrow functions',
  'break and continue statements',
  'for...of loops',
  'for...in loops',
  'array methods like map/filter/reduce/push/pop',
  'array or object mutation inside loops',
  'object literals and object methods',
  'nested advanced function calls',
  'try/catch',
  'new expressions',
  'mutual recursion such as even() calling odd()',
  'helper function calls other than the selected self-recursive function',
  'nested functions',
  'closures',
  'async recursion',
  'recursion through array methods',
];

export const SUPPORTED_TRACE_EXAMPLE = `function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}`;
