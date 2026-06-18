import {
  PythonStatement,
  PythonConditionalBranch
} from '../ast/pythonAstTypes';

export function parsePythonStatements(lines: {text: string, lineNo: number}[], baseIndent: number): PythonStatement[] {
  const statements: PythonStatement[] = [];
  let i = 0;

  function getIndent(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? match[1]!.length : 0;
  }

  function consumeIndentedBlock(startIndex: number, indent: number): { blockLines: {text: string, lineNo: number}[], nextIndex: number } {
    const blockLines: {text: string, lineNo: number}[] = [];
    let idx = startIndex;
    while (idx < lines.length && (lines[idx]!.text.trim() === '' || lines[idx]!.text.trim().startsWith('#') || getIndent(lines[idx]!.text) >= indent)) {
      blockLines.push(lines[idx]!);
      idx++;
    }
    return { blockLines, nextIndex: idx };
  }

  function getNextBodyIndent(startIndex: number): number {
    let idx = startIndex;
    while (idx < lines.length) {
      if (lines[idx]!.text.trim() !== '' && !lines[idx]!.text.trim().startsWith('#')) {
        return getIndent(lines[idx]!.text);
      }
      idx++;
    }
    return -1;
  }

  while (i < lines.length) {
    const rawLine = lines[i]!.text;
    const trimmed = rawLine.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      i++;
      continue;
    }

    const indent = getIndent(rawLine);
    if (indent < baseIndent) {
      break; // End of block
    }
    if (indent > baseIndent) {
      throw new Error(`Unexpected indentation at line: ${trimmed}`);
    }

    if (trimmed === 'pass') {
      i++;
      continue;
    }

    if (trimmed.startsWith('return ') || trimmed === 'return') {
      const expr = trimmed.substring(7).trim() || null;
      statements.push({ line: lines[i]!.lineNo, type: 'return', expression: expr });
      i++;
      continue;
    }

    const augAssignMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(\+=|-=|\*=|\/=|\/\/=|%=)\s*(.*)$/);
    if (augAssignMatch) {
      statements.push({ 
        line: lines[i]!.lineNo,
        type: 'augmented_assignment', 
        name: augAssignMatch[1]!, 
        operator: augAssignMatch[2] as any, 
        expression: augAssignMatch[3]! 
      });
      i++;
      continue;
    }

    const assignMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (assignMatch && !trimmed.startsWith('if ') && !trimmed.startsWith('elif ') && !trimmed.startsWith('else:') && !trimmed.startsWith('while ') && !trimmed.startsWith('for ')) {
      statements.push({ line: lines[i]!.lineNo, type: 'assignment', name: assignMatch[1]!, expression: assignMatch[2]! });
      i++;
      continue;
    }

    if (trimmed.startsWith('while ')) {
      const conditionMatch = trimmed.match(/^while\s+(.*):$/);
      if (!conditionMatch) throw new Error(`Invalid while statement: ${trimmed}`);
      i++;
      const bodyIndent = getNextBodyIndent(i);
      if (bodyIndent <= baseIndent) throw new Error(`Expected indented block after while: ${trimmed}`);
      
      const { blockLines, nextIndex } = consumeIndentedBlock(i, bodyIndent);
      const body = parsePythonStatements(blockLines, bodyIndent);
      statements.push({ line: lines[i]!.lineNo, type: 'while', condition: conditionMatch[1]!.trim(), body });
      i = nextIndex;
      continue;
    }

    if (trimmed.startsWith('for ')) {
      const forMatch = trimmed.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\((.*)\):$/);
      if (!forMatch) {
        throw new Error(`Unsupported for statement: ${trimmed}. Only for i in range(...) is supported.`);
      }
      
      const variableName = forMatch[1]!;
      const argsStr = forMatch[2]!;
      const args = argsStr.split(',').map(s => s.trim()).filter(s => s !== '');
      if (args.length === 0 || args.length > 3) {
        throw new Error(`Unsupported range arguments: ${argsStr}`);
      }
      
      i++;
      const bodyIndent = getNextBodyIndent(i);
      if (bodyIndent <= baseIndent) throw new Error(`Expected indented block after for: ${trimmed}`);
      
      const { blockLines, nextIndex } = consumeIndentedBlock(i, bodyIndent);
      const body = parsePythonStatements(blockLines, bodyIndent);
      statements.push({ line: lines[i]!.lineNo, type: 'for_range', variableName, rangeArgs: args, body });
      i = nextIndex;
      continue;
    }

    if (trimmed.startsWith('if ')) {
      const conditionMatch = trimmed.match(/^if\s+(.*):$/);
      if (!conditionMatch) throw new Error(`Invalid if statement: ${trimmed}`);
      
      const startLine = lines[i]!.lineNo;
      const ifBranch: PythonConditionalBranch = {
        line: startLine,
        condition: conditionMatch[1]!.trim(),
        body: []
      };
      
      i++;
      let bodyIndent = getNextBodyIndent(i);
      if (bodyIndent <= baseIndent) throw new Error(`Expected indented block after if: ${trimmed}`);
      
      let res = consumeIndentedBlock(i, bodyIndent);
      ifBranch.body = parsePythonStatements(res.blockLines, bodyIndent);
      i = res.nextIndex;
      
      const branches = [ifBranch];
      let elseBody: PythonStatement[] | null = null;
      
      while (i < lines.length) {
        const nextTrimmed = lines[i]!.text.trim();
        const nextIndent = getIndent(lines[i]!.text);
        
        if (nextTrimmed === '' || nextTrimmed.startsWith('#')) {
           i++; continue; 
        }
        
        if (nextIndent !== baseIndent) break;
        
        if (nextTrimmed.startsWith('elif ')) {
          const elifMatch = nextTrimmed.match(/^elif\s+(.*):$/);
          if (!elifMatch) throw new Error(`Invalid elif statement: ${nextTrimmed}`);
          
          const elifLine = lines[i]!.lineNo;
          i++;
          const elifRes = consumeIndentedBlock(i, bodyIndent);
          branches.push({
            line: elifLine,
            condition: elifMatch[1]!.trim(),
            body: parsePythonStatements(elifRes.blockLines, bodyIndent)
          });
          i = elifRes.nextIndex;
        } else if (nextTrimmed === 'else:') {
          i++;
          const elseRes = consumeIndentedBlock(i, bodyIndent);
          elseBody = parsePythonStatements(elseRes.blockLines, bodyIndent);
          i = elseRes.nextIndex;
          break;
        } else {
          break;
        }
      }
      
      statements.push({ line: startLine, type: 'if', branches, elseBody });
      continue;
    }
    
    throw new Error(`Unsupported statement: ${trimmed}`);
  }

  return statements;
}
