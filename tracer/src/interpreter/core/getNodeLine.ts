import type { Node } from '@babel/types';

export function getNodeLine(node: Node): number | null {
  return node.loc?.start.line ?? null;
}
