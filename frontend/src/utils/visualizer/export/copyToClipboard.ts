/**
 * Copies the given text to the clipboard.
 * Returns true on success, false on failure.
 * Does not log the text.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
