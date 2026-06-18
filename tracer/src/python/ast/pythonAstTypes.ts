// Token types
export type PythonToken = 
  | { type: 'number', value: number }
  | { type: 'string', value: string }
  | { type: 'boolean', value: boolean }
  | { type: 'none', value: null }
  | { type: 'identifier', name: string }
  | { type: 'operator', op: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'lbracket' }
  | { type: 'rbracket' }
  | { type: 'comma' }
  | { type: 'eof' };

// Statement types
export type PythonStatement =
  | PythonAssignmentStatement
  | PythonAugmentedAssignmentStatement
  | PythonReturnStatement
  | PythonIfStatement
  | PythonWhileStatement
  | PythonForRangeStatement;

export type PythonAssignmentStatement = {
  line: number;
  type: 'assignment';
  name: string;
  expression: string;
};

export type PythonAugmentedAssignmentStatement = {
  line: number;
  type: 'augmented_assignment';
  name: string;
  operator: '+=' | '-=' | '*=' | '/=' | '//=' | '%=';
  expression: string;
};

export type PythonReturnStatement = {
  line: number;
  type: 'return';
  expression: string | null;
};

export type PythonIfStatement = {
  line: number;
  type: 'if';
  branches: PythonConditionalBranch[];
  elseBody: PythonStatement[] | null;
};

export type PythonConditionalBranch = {
  line: number;
  condition: string;
  body: PythonStatement[];
};

export type PythonWhileStatement = {
  line: number;
  type: 'while';
  condition: string;
  body: PythonStatement[];
};

export type PythonForRangeStatement = {
  line: number;
  type: 'for_range';
  variableName: string;
  rangeArgs: string[];
  body: PythonStatement[];
};

// Function types
export type PythonFunctionDef = {
  startLine: number;
  type: 'function_def';
  name: string;
  params: string[];
  body: PythonStatement[];
};

// Expression types (evaluator specific)
export type PythonExpression =
  | { type: 'binary', left: PythonExpression, operator: string, right: PythonExpression }
  | { type: 'call', functionName: string, args: PythonExpression[] }
  | { type: 'identifier', name: string }
  | { type: 'literal', value: number | string | boolean | null }
  | { type: 'list', elements: PythonExpression[] }
  | { type: 'index', list: PythonExpression, index: PythonExpression };
