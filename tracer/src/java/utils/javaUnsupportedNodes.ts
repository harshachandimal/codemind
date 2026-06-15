import { parseJavaSource } from '../ast/parseJavaSource';

export type JavaUnsupportedSyntaxViolation = {
  code: string;
  message: string;
  syntax?: string;
};

export class TraceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TraceParseError';
  }
}

export function validateJavaSupportedSyntax(params: {
  sourceCode: string;
  entryFunction?: string | null;
}): JavaUnsupportedSyntaxViolation[] {
  const violations: JavaUnsupportedSyntaxViolation[] = [];
  const { sourceCode, entryFunction } = params;

  let parseSummary;
  try {
    parseSummary = parseJavaSource(sourceCode);
  } catch (err: any) {
    violations.push({
      code: 'JAVA_PARSE_ERROR',
      message: err.message || 'Failed to parse Java source.',
    });
    return violations;
  }

  if (parseSummary.hasSyntaxError) {
    violations.push({
      code: 'JAVA_PARSE_ERROR',
      message: 'Java source contains unbalanced braces/parentheses or missing class/method.',
    });
  }

  const cleanCode = sourceCode.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  if (/\b(?:package|import)\b/.test(cleanCode)) {
    violations.push({
      code: 'JAVA_IMPORT_OR_PACKAGE_UNSUPPORTED',
      message: 'Java package/import declarations are not supported in runtime tracing.'
    });
  }

  if (/@\w+/.test(cleanCode)) {
    violations.push({ code: 'JAVA_ANNOTATION_UNSUPPORTED', message: 'Annotations are not supported.' });
  }

  if (/\bextends\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_INHERITANCE_UNSUPPORTED', message: 'Inheritance is not supported.' });
  }
  if (/\binterface\b/.test(cleanCode) || /\bimplements\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_INTERFACE_UNSUPPORTED', message: 'Interfaces are not supported.' });
  }
  if (/\benum\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_ENUM_UNSUPPORTED', message: 'Enums are not supported.' });
  }
  if (/\brecord\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_RECORD_UNSUPPORTED', message: 'Records are not supported.' });
  }

  if (/\bnew\s+\w+/.test(cleanCode)) {
    violations.push({ code: 'JAVA_OBJECT_CREATION_UNSUPPORTED', message: 'Object creation with new is not supported.' });
  }

  if (/\b(?:private|protected|public)?\s*(?:static\s+)?(?:int|double|boolean|String|int\[\]|String\[\])\s+[A-Za-z0-9_]+\s*(?:=|;)(?!\s*\()/.test(cleanCode)) {
    // To avoid local variables, check if it's declared with public/private/protected OR static.
    // Actually, local variables can't be public/private/protected/static.
    // So if it has any of those modifiers, it's a field.
    if (/\b(?:private|protected|public|static)\s+(?:int|double|boolean|String|int\[\]|String\[\])\s+[A-Za-z0-9_]+\s*(?:=|;)(?!\s*\()/.test(cleanCode)) {
      violations.push({ code: 'JAVA_FIELD_UNSUPPORTED', message: 'Fields and global variables are not supported.' });
    } else {
      // It could be a package-private instance field: `int count = 0;` inside class body.
      // This is harder to catch without a real AST. We'll rely on the modifier check for MVP since static fields are the main danger.
    }
  }

  if (/\b(?:public|private|protected)\s+(?!static\b)[A-Za-z0-9_\[\]<>]+\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{/.test(cleanCode)) {
    violations.push({ code: 'JAVA_NON_STATIC_METHOD_UNSUPPORTED', message: 'Non-static methods are not supported.' });
  }

  const methodCounts: Record<string, number> = {};
  parseSummary.staticMethodNames.forEach((name) => {
    methodCounts[name] = (methodCounts[name] || 0) + 1;
    if (methodCounts[name] > 1 && !violations.find(v => v.code === 'JAVA_METHOD_OVERLOADING_UNSUPPORTED')) {
      violations.push({ code: 'JAVA_METHOD_OVERLOADING_UNSUPPORTED', message: 'Method overloading is not supported.' });
    }
  });

  const apis = ['System\\.out', 'System\\.err', 'System\\.in', 'System\\.exit', 'Runtime\\.getRuntime', 'ProcessBuilder', '\\bThread\\b', '\\bFile\\b', '\\bFiles\\b', '\\bSocket\\b', 'ServerSocket', '\\bScanner\\b', 'Class\\.forName', 'getClass\\(\\)'];
  if (new RegExp(apis.join('|')).test(cleanCode)) {
    violations.push({ code: 'JAVA_API_UNSUPPORTED', message: 'Java standard library/system APIs are not supported in runtime tracing.' });
  }

  if (/\b(?:try|catch|finally)\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_EXCEPTION_UNSUPPORTED', message: 'Exceptions are not supported.' });
  }
  if (/\bthrow(?:s)?\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_THROW_UNSUPPORTED', message: 'throw/throws are not supported.' });
  }

  if (/\bswitch\s*\(/.test(cleanCode)) {
    violations.push({ code: 'JAVA_SWITCH_UNSUPPORTED', message: 'switch is not supported.' });
  }
  if (/\bdo\s*\{/.test(cleanCode)) {
    violations.push({ code: 'JAVA_DO_WHILE_UNSUPPORTED', message: 'do-while is not supported.' });
  }
  if (/\bsynchronized\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_SYNCHRONIZED_UNSUPPORTED', message: 'synchronized is not supported.' });
  }
  if (/\bbreak\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_BREAK_UNSUPPORTED', message: 'break is not supported.' });
  }
  if (/\bcontinue\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_CONTINUE_UNSUPPORTED', message: 'continue is not supported.' });
  }

  if (/->/.test(cleanCode)) {
    violations.push({ code: 'JAVA_LAMBDA_UNSUPPORTED', message: 'Lambdas are not supported.' });
  }
  if (/\.stream\(/.test(cleanCode)) {
    violations.push({ code: 'JAVA_STREAM_UNSUPPORTED', message: 'Streams are not supported.' });
  }
  if (/\b(?:List|Map|Set|ArrayList|HashMap)\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_COLLECTION_UNSUPPORTED', message: 'Collections are not supported.' });
  }
  if (/<[A-Z][a-zA-Z0-9]*>/.test(cleanCode)) {
    violations.push({ code: 'JAVA_GENERICS_UNSUPPORTED', message: 'Generics are not supported.' });
  }

  if (/\bfor\s*\([^;]+:[^)]+\)/.test(cleanCode)) {
    violations.push({ code: 'JAVA_ENHANCED_FOR_UNSUPPORTED', message: 'Enhanced for loop is not supported.' });
  }

  const keywords = ['if', 'for', 'while', 'switch', 'return', 'new', 'catch'];
  const callRegex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  
  if (/\bArrays\b/.test(cleanCode)) {
    violations.push({ code: 'JAVA_ARRAYS_CLASS_UNSUPPORTED', message: 'Arrays utility class is not supported.' });
  }

  if (/\[[^\]]+\]\s*(?:\+|-|\*|\/|%)?=(?!=)/.test(cleanCode) || /\[[^\]]+\]\s*(?:\+\+|--)/.test(cleanCode) || /(?:\+\+|--)\s*[A-Za-z0-9_]+\[/.test(cleanCode)) {
    violations.push({ code: 'JAVA_ARRAY_MUTATION_UNSUPPORTED', message: 'Array mutation is not supported.' });
  }

  if (/\.[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(cleanCode) && !violations.find(v => v.code === 'JAVA_METHOD_CALL_UNSUPPORTED')) {
    violations.push({ code: 'JAVA_METHOD_CALL_UNSUPPORTED', message: 'Method calls are not supported.' });
  }

  for (const method of parseSummary.staticMethodNames) {
    if (method === entryFunction) continue;
    const regex = new RegExp('\\b' + method + '\\s*\\(', 'g');
    const matches = cleanCode.match(regex);
    if (matches && matches.length > 1) {
      if (!violations.find(v => v.code === 'JAVA_METHOD_CALL_UNSUPPORTED')) {
        violations.push({ code: 'JAVA_METHOD_CALL_UNSUPPORTED', message: 'Helper method calls and mutual recursion are not supported.' });
      }
    }
  }

  return violations;
}

export function assertJavaSupportedSyntax(params: {
  sourceCode: string;
  entryFunction?: string | null;
}): void {
  const violations = validateJavaSupportedSyntax(params);
  if (violations.length > 0) {
    throw new TraceParseError('Java code contains unsupported syntax for runtime tracing. ' + JSON.stringify(violations));
  }
}
