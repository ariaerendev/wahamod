export function ensureBase64(
  data: string | Uint8Array | ArrayBuffer | null | undefined,
): string | null | undefined {
  // Preserves null or undefined
  if (!data) {
    return data as any;
  }
  // Already base64
  if (typeof data === 'string') {
    return data.trim();
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data).toString('base64');
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(data)).toString('base64');
  }

  return null;
}
