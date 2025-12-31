export function isEmptyString(content: string) {
  if (!content) {
    return true;
  }
  return content === '' || content === '\n';
}
