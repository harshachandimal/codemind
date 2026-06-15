import { TraceInterpreterError } from '../errors/javaErrors';

export type JavaStatement = 
  | JavaVariableDeclarationStatement 
  | JavaAssignmentStatement 
  | JavaAugmentedAssignmentStatement
  | JavaIncrementStatement
  | JavaReturnStatement
  | JavaIfStatement
  | JavaWhileStatement
  | JavaForStatement;

export type JavaVariableDeclarationStatement = {
  type: 'variable_declaration';
  typeName: 'int' | 'double' | 'boolean' | 'String' | 'int[]' | 'double[]' | 'boolean[]' | 'String[]' | 'int[][]' | 'double[][]' | 'boolean[][]' | 'String[][]';
  name: string;
  expression: string | null;
};

export type JavaAssignmentStatement = {
  type: 'assignment';
  name: string;
  expression: string;
};

export type JavaAugmentedAssignmentStatement = {
  type: 'augmented_assignment';
  name: string;
  operator: '+=' | '-=' | '*=' | '/=' | '%=';
  expression: string;
};

export type JavaIncrementStatement = {
  type: 'increment';
  name: string;
  operator: '++' | '--';
};

export type JavaReturnStatement = {
  type: 'return';
  expression: string | null;
};

export type JavaConditionalBranch = {
  condition: string;
  body: JavaStatement[];
};

export type JavaIfStatement = {
  type: 'if';
  branches: JavaConditionalBranch[];
  elseBody: JavaStatement[] | null;
};

export type JavaWhileStatement = {
  type: 'while';
  condition: string;
  body: JavaStatement[];
};

export type JavaForInitStatement =
  | JavaVariableDeclarationStatement
  | JavaAssignmentStatement;

export type JavaForUpdateStatement =
  | JavaAssignmentStatement
  | JavaAugmentedAssignmentStatement
  | JavaIncrementStatement;

export type JavaForStatement = {
  type: 'for';
  init: JavaForInitStatement | null;
  condition: string | null;
  update: JavaForUpdateStatement | null;
  body: JavaStatement[];
};

export function parseJavaStatements(bodyText: string): JavaStatement[] {
  const result: JavaStatement[] = [];
  let pos = 0;

  function skipWhitespace() {
    while (pos < bodyText.length && /\s/.test(bodyText[pos] as string)) {
      pos++;
    }
  }

  function readUntil(char: string): string {
    let start = pos;
    while (pos < bodyText.length && bodyText[pos] !== char) {
      pos++;
    }
    const val = bodyText.substring(start, pos);
    if (pos < bodyText.length) pos++; // skip the char
    return val;
  }

  function readBlock(): string {
    skipWhitespace();
    if (bodyText[pos] !== '{') {
      throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected { for block');
    }
    pos++;
    let depth = 1;
    let start = pos;
    while (pos < bodyText.length && depth > 0) {
      if (bodyText[pos] === '{') depth++;
      else if (bodyText[pos] === '}') depth--;
      pos++;
    }
    if (depth !== 0) throw new TraceInterpreterError('JAVA_PARSE_ERROR: Unbalanced braces in block');
    return bodyText.substring(start, pos - 1);
  }

  function parseCondition(): string {
    skipWhitespace();
    if (bodyText[pos] !== '(') throw new TraceInterpreterError('JAVA_PARSE_ERROR: Expected ( after keyword');
    pos++;
    
    let depth = 1;
    let condStart = pos;
    while (pos < bodyText.length && depth > 0) {
      if (bodyText[pos] === '(') depth++;
      else if (bodyText[pos] === ')') depth--;
      pos++;
    }
    return bodyText.substring(condStart, pos - 1).trim();
  }

  function parseIfStatement(): JavaIfStatement {
    const condition = parseCondition();
    const blockText = readBlock();
    const branches: JavaConditionalBranch[] = [
      { condition, body: parseJavaStatements(blockText) }
    ];
    let elseBody: JavaStatement[] | null = null;

    while (true) {
      skipWhitespace();
      if (bodyText.startsWith('else', pos) && (pos + 4 === bodyText.length || /\s|\{/.test(bodyText[pos + 4] as string))) {
        let tempPos = pos + 4;
        let isElseIf = false;
        while (tempPos < bodyText.length && /\s/.test(bodyText[tempPos] as string)) tempPos++;
        if (bodyText.startsWith('if', tempPos) && (tempPos + 2 === bodyText.length || /\s|\(/.test(bodyText[tempPos + 2] as string))) {
            isElseIf = true;
            pos = tempPos + 2;
        } else {
            pos += 4;
        }

        if (isElseIf) {
          const econdition = parseCondition();
          const eblockText = readBlock();
          branches.push({ condition: econdition, body: parseJavaStatements(eblockText) });
        } else {
          const eblockText = readBlock();
          elseBody = parseJavaStatements(eblockText);
          break;
        }
      } else {
        break;
      }
    }

    return { type: 'if', branches, elseBody };
  }

  function parseWhileStatement(): JavaWhileStatement {
    const condition = parseCondition();
    const blockText = readBlock();
    return {
      type: 'while',
      condition,
      body: parseJavaStatements(blockText)
    };
  }

  function parseForStatement(): JavaForStatement {
    const header = parseCondition();
    if (header.includes(':')) {
        throw new TraceInterpreterError('JAVA_UNSUPPORTED_STATEMENT: Enhanced for loop is not supported');
    }
    const parts = header.split(';');
    if (parts.length !== 3) {
        throw new TraceInterpreterError('JAVA_PARSE_ERROR: Invalid for loop header');
    }

    let init: JavaForInitStatement | null = null;
    let condition: string | null = null;
    let update: JavaForUpdateStatement | null = null;

    const initStr = parts[0]!.trim();
    if (initStr) {
        const parsedInit = parseSimpleStatementInner(initStr);
        if (!parsedInit || (parsedInit.type !== 'variable_declaration' && parsedInit.type !== 'assignment')) {
            throw new TraceInterpreterError('JAVA_PARSE_ERROR: Invalid for loop init');
        }
        init = parsedInit as JavaForInitStatement;
    }

    const condStr = parts[1]!.trim();
    if (condStr) {
        condition = condStr;
    }

    const updateStr = parts[2]!.trim();
    if (updateStr) {
        const parsedUpdate = parseSimpleStatementInner(updateStr);
        if (!parsedUpdate || (parsedUpdate.type !== 'assignment' && parsedUpdate.type !== 'augmented_assignment' && parsedUpdate.type !== 'increment')) {
            throw new TraceInterpreterError('JAVA_PARSE_ERROR: Invalid for loop update');
        }
        update = parsedUpdate as JavaForUpdateStatement;
    }

    const blockText = readBlock();

    return {
        type: 'for',
        init,
        condition,
        update,
        body: parseJavaStatements(blockText)
    };
  }

  function parseSimpleStatementInner(stmt: string): JavaStatement | undefined {
    stmt = stmt.trim();
    if (!stmt) return undefined;
    
    if (stmt.startsWith('return ') || stmt === 'return') {
      const expr = stmt.replace(/^return\b/, '').trim();
      return { type: 'return', expression: expr || null };
    }

    const declMatch = stmt.match(/^((?:int|double|boolean|String)(?:\[\]){0,2})\s+([A-Za-z0-9_]+)(?:\s*=\s*(.*))?$/);
    if (declMatch) {
      const expr = declMatch[3] || null;
      if (expr && expr.includes(',') && !expr.trim().startsWith('{')) {
         throw new TraceInterpreterError('JAVA_UNSUPPORTED_STATEMENT: Multiple variable declaration is not supported');
      }
      return {
        type: 'variable_declaration',
        typeName: declMatch[1] as any,
        name: declMatch[2] || '',
        expression: expr
      };
    }

    const augAssignMatch = stmt.match(/^([A-Za-z0-9_]+)\s*(\+=|-=|\*=|\/=|%=)\s*(.*)$/);
    if (augAssignMatch) {
      return {
        type: 'augmented_assignment',
        name: augAssignMatch[1] || '',
        operator: augAssignMatch[2] as any,
        expression: augAssignMatch[3] || ''
      };
    }

    const assignMatch = stmt.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (assignMatch) {
      return {
        type: 'assignment',
        name: assignMatch[1] || '',
        expression: assignMatch[2] || ''
      };
    }
    
    const postfixMatch = stmt.match(/^([A-Za-z0-9_]+)\s*(\+\+|--)$/);
    if (postfixMatch) {
      return {
        type: 'increment',
        name: postfixMatch[1] || '',
        operator: postfixMatch[2] as any
      };
    }

    const prefixMatch = stmt.match(/^(\+\+|--)\s*([A-Za-z0-9_]+)$/);
    if (prefixMatch) {
      return {
        type: 'increment',
        name: prefixMatch[2] || '',
        operator: prefixMatch[1] as any
      };
    }

    throw new TraceInterpreterError('JAVA_UNSUPPORTED_STATEMENT: Unsupported statement "' + stmt + '"');
  }

  function parseSimpleStatement(stmt: string) {
      const parsed = parseSimpleStatementInner(stmt);
      if (parsed) result.push(parsed);
  }

  while (pos < bodyText.length) {
    skipWhitespace();
    if (pos >= bodyText.length) break;

    if (bodyText.startsWith('if', pos) && (pos + 2 === bodyText.length || /\s|\(/.test(bodyText[pos + 2] as string))) {
      pos += 2;
      result.push(parseIfStatement());
    } else if (bodyText.startsWith('for', pos) && (pos + 3 === bodyText.length || /\s|\(/.test(bodyText[pos + 3] as string))) {
      pos += 3;
      result.push(parseForStatement());
    } else if (bodyText.startsWith('while', pos) && (pos + 5 === bodyText.length || /\s|\(/.test(bodyText[pos + 5] as string))) {
      pos += 5;
      result.push(parseWhileStatement());
    } else {
      const stmt = readUntil(';');
      parseSimpleStatement(stmt);
    }
  }

  return result;
}
