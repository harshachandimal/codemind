/**
 * Triggers a browser file download from an in-memory string.
 *
 * Creates a temporary Blob URL, clicks a hidden anchor, then revokes the URL.
 * Must only be called in a browser context (not during SSR).
 */
export function downloadTextFile(params: {
  filename: string;
  content: string;
  mimeType: string;
}): void {
  const { filename, content, mimeType } = params;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();

  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}
