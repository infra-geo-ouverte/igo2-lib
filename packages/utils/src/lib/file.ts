/**
 * Trigger download of a file
 *
 * @param content File content
 * @param mimeType File mime type
 * @param fileName File name
 */
export function downloadContent(content: string, mimeType: string, fileName: string) {
  const uri = `data:${mimeType},${encodeURIComponent(content)}`;
  downloadFromUri(uri, fileName);
}

/**
 * Trigger download of a file
 *
 * @param content File content
 * @param mimeType File mime type
 * @param fileName File name
 */
export function downloadFromUri(uri: string, fileName: string) {
  const element = document.createElement('a');
  element.setAttribute('href', uri);
  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
