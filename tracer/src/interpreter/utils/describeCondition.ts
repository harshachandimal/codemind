import type { Node, Identifier, BooleanLiteral, BinaryExpression, NumericLiteral, StringLiteral } from '@babel/types';

export function describeCondition(node: Node): string {
  if (node.type === 'Identifier') {
    return (node as Identifier).name;
  }
  if (node.type === 'BooleanLiteral') {
    return String((node as BooleanLiteral).value);
  }
  if (node.type === 'BinaryExpression') {
    const bin = node as BinaryExpression;
    const left = describeCondition(bin.left as Node);
    const right = describeCondition(bin.right as Node);
    return `${left} ${bin.operator} ${right}`;
  }
  if (node.type === 'NumericLiteral') {
    return String((node as NumericLiteral).value);
  }
  if (node.type === 'StringLiteral') {
    return `"${(node as StringLiteral).value}"`;
  }
  return '';
}
