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
  'array input values',
  'array index reads (arr[i])',
  'array length reads (arr.length)',
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
  'array methods like map/filter/reduce/push/pop',
  'object literals and object methods',
  'while loops',
  'recursion for now',
  'nested advanced function calls',
  'try/catch',
  'new expressions',
];

export const SUPPORTED_TRACE_EXAMPLE = `function sum(arr) {
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    total = total + arr[i];
  }

  return total;
}`;
