export function formatCallStack(callStack: string[] | null | undefined): string {
  if (!callStack || callStack.length === 0) return '';
  if (callStack.length <= 6) return callStack.join(' → ');
  
  const first = callStack.slice(0, 3).join(' → ');
  const last = callStack.slice(-2).join(' → ');
  const more = callStack.length - 5;
  
  return `${first} → ... → ${last} (+${more} more)`;
}
