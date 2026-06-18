import { TraceInterpreterError } from '../errors/javaErrors';

export type JavaStatementBase = {
  line: number;
};

export type JavaStatement = JavaStatementBase & (
  | JavaVariableDeclarationStatement 
  | JavaAssignmentStatement 
  | JavaAugmentedAssignmentStatement
  | JavaIncrementStatement
  | JavaReturnStatement
  | JavaIfStatement
  | JavaWhileStatement
  | JavaForStatement
);

export type JavaVariableDeclarationStatement = {
  line: number;
  type: 'variable_declaration';
  typeName: 'int' | 'double' | 'boolean' | 'String' | 'int[]' | 'double[]' | 'boolean[]' | 'String[]' | 'int[][]' | 'double[][]' | 'boolean[][]' | 'String[][]';
  name: string;
  expression: string | null;
};

export type JavaAssignmentStatement = {
  line: number;
  type: 'assignment';
  name: string;
  expression: string;
};

export type JavaAugmentedAssignmentStatement = {
  line: number;
  type: 'augmented_assignment';
  name: string;
  operator: '+=' | '-=' | '*=' | '/=' | '%=';
  expression: string;
};

export type JavaIncrementStatement = {
  line: number;
  type: 'increment';
  name: string;
  operator: '++' | '--';
};

export type JavaReturnStatement = {
  line: number;
  type: 'return';
  expression: string | null;
};

export type JavaConditionalBranch = {
  condition: string;
  body: JavaStatement[];
};

export type JavaIfStatement = {
  line: number;
  type: 'if';
  branches: JavaConditionalBranch[];
  elseBody: JavaStatement[] | null;
};

export type JavaWhileStatement = {
  line: number;
  type: 'while';
  condition: string;
  body: JavaStatement[];
};

export type JavaForInitStatement = (JavaStatementBase & JavaVariableDeclarationStatement) | (JavaStatementBase & JavaAssignmentStatement);

export type JavaForUpdateStatement = (JavaStatementBase & JavaAssignmentStatement) | (JavaStatementBase & JavaAugmentedAssignmentStatement) | (JavaStatementBase & JavaIncrementStatement);

export type JavaForStatement = {
  line: number;
  type: 'for';
  init: JavaForInitStatement | null;
  condition: string | null;
  update: JavaForUpdateStatement | null;
  body: JavaStatement[];
};

export function parseJavaStatements(bodyText: string, startLine: number = 1): JavaStatement[] {
  const result: JavaStatement[] = [];
  let pos = 0;

  function getLine(p: number) {
    let line = startLine;
    for (let i = 0; i < p; i++) {
      if (bodyText[i] === '\n') line++;
    }
    return line;
  }

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

  function readBlock(): { text: string; startPos: number } {
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
    return { text: bodyText.substring(start, pos - 1), startPos: start };
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

  function parseIfStatement(stmtStartPos: number): JavaStatementBase & JavaIfStatement {
    const line = getLine(stmtStartPos);
    const condition = parseCondition();
    const block = readBlock();
    const branches: JavaConditionalBranch[] = [
      { condition, body: parseJavaStatements(block.text, getLine(block.startPos)) }
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
          const eblock = readBlock();
          branches.push({ condition: econdition, body: parseJavaStatements(eblock.text, getLine(eblock.startPos)) });
        } else {
          const eblock = readBlock();
          elseBody = parseJavaStatements(eblock.text, getLine(eblock.startPos));
          break;
        }
      } else {
        break;
      }
    }

    return { type: 'if', line, branches, elseBody };
  }

  function parseWhileStatement(stmtStartPos: number): JavaStatementBase & JavaWhileStatement {
    const line = getLine(stmtStartPos);
    const condition = parseCondition();
    const block = readBlock();
    return {
      type: 'while',
      line,
      condition,
      body: parseJavaStatements(block.text, getLine(block.startPos))
    };
  }

  function parseForStatement(stmtStartPos: number): JavaStatementBase & JavaForStatement {
    const line = getLine(stmtStartPos);
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
        const parsedInit = parseSimpleStatementInner(initStr, stmtStartPos);
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
        // use stmtStartPos for update line as well, it's just one line typically
        const parsedUpdate = parseSimpleStatementInner(updateStr, stmtStartPos);
        if (!parsedUpdate || (parsedUpdate.type !== 'assignment' && parsedUpdate.type !== 'augmented_assignment' && parsedUpdate.type !== 'increment')) {
            throw new TraceInterpreterError('JAVA_PARSE_ERROR: Invalid for loop update');
        }
        update = parsedUpdate as JavaForUpdateStatement;
    }

    const block = readBlock();

    return {
        type: 'for',
        line,
        init,
        condition,
        update,
        body: parseJavaStatements(block.text, getLine(block.startPos))
    };
  }

  function parseSimpleStatementInner(stmt: string, stmtStartPos: number): JavaStatement | undefined {
    stmt = stmt.trim();
    if (!stmt) return undefined;
    const line = getLine(stmtStartPos);
    
    if (stmt.startsWith('return ') || stmt === 'return') {
      const expr = stmt.replace(/^return\b/, '').trim();
      return { type: 'return', line, expression: expr || null };
    }

    const declMatch = stmt.match(/^((?:int|double|boolean|String)(?:\[\]){0,2})\s+([A-Za-z0-9_]+)(?:\s*=\s*(.*))?$/);
    if (declMatch) {
      const expr = declMatch[3] || null;
      if (expr && expr.includes(',') && !expr.trim().startsWith('{')) {
         throw new TraceInterpreterError('JAVA_UNSUPPORTED_STATEMENT: Multiple variable declaration is not supported');
      }
      return {
        type: 'variable_declaration',
        line,
        typeName: declMatch[1] as any,
        name: declMatch[2] || '',
        expression: expr
      };
    }

    const augAssignMatch = stmt.match(/^([A-Za-z0-9_]+)\s*(\+=|-=|\*=|\/=|%=)\s*(.*)$/);
    if (augAssignMatch) {
      return {
        type: 'augmented_assignment',
        line,
        name: augAssignMatch[1] || '',
        operator: augAssignMatch[2] as any,
        expression: augAssignMatch[3] || ''
      };
    }

    const assignMatch = stmt.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (assignMatch) {
      return {
        type: 'assignment',
        line,
        name: assignMatch[1] || '',
        expression: assignMatch[2] || ''
      };
    }
    
    const postfixMatch = stmt.match(/^([A-Za-z0-9_]+)\s*(\+\+|--)$/);
    if (postfixMatch) {
      return {
        type: 'increment',
        line,
        name: postfixMatch[1] || '',
        operator: postfixMatch[2] as any
      };
    }

    const prefixMatch = stmt.match(/^(\+\+|--)\s*([A-Za-z0-9_]+)$/);
    if (prefixMatch) {
      return {
        type: 'increment',
        line,
        name: prefixMatch[2] || '',
        operator: prefixMatch[1] as any
      };
    }

    throw new TraceInterpreterError('JAVA_UNSUPPORTED_STATEMENT: Unsupported statement "' + stmt + '"');
  }

  function parseSimpleStatement(stmt: string, stmtStartPos: number) {
      const parsed = parseSimpleStatementInner(stmt, stmtStartPos);
      if (parsed) result.push(parsed);
  }

  while (pos < bodyText.length) {
    skipWhitespace();
    if (pos >= bodyText.length) break;

    if (bodyText.startsWith('if', pos) && (pos + 2 === bodyText.length || /\s|\(/.test(bodyText[pos + 2] as string))) {
      const stmtStartPos = pos;
      pos += 2;
      result.push(parseIfStatement(stmtStartPos));
    } else if (bodyText.startsWith('for', pos) && (pos + 3 === bodyText.length || /\s|\(/.test(bodyText[pos + 3] as string))) {
      const stmtStartPos = pos;
      pos += 3;
      result.push(parseForStatement(stmtStartPos));
    } else if (bodyText.startsWith('while', pos) && (pos + 5 === bodyText.length || /\s|\(/.test(bodyText[pos + 5] as string))) {
      const stmtStartPos = pos;
      pos += 5;
      result.push(parseWhileStatement(stmtStartPos));
    } else {
      const stmtStartPos = pos;
      const stmt = readUntil(';');
      parseSimpleStatement(stmt, stmtStartPos);
    }
  }

  return result;
}
