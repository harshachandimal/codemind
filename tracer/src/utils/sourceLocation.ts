/**
 * Helper to safely extract source line and column numbers from AST nodes.
 * Supports Babel/ESTree location formats.
 */

export function getLineNumber(node: unknown): number | null {
  if (!node || typeof node !== 'object') return null;
  const loc = (node as any).loc;
  if (loc && loc.start && typeof loc.start.line === 'number' && loc.start.line > 0) {
    return loc.start.line;
  }
  return null;
}

export function getColumnNumber(node: unknown): number | null {
  if (!node || typeof node !== 'object') return null;
  const loc = (node as any).loc;
  if (loc && loc.start && typeof loc.start.column === 'number' && loc.start.column >= 0) {
    return loc.start.column;
  }
  return null;
}
