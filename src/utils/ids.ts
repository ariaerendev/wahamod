import { ulid } from 'ulid';

/**
 * Generate prefix uuid (but remove -)
 * @param prefix
 */
export function generatePrefixedId(prefix: string) {
  return `${prefix}_${ulid().toLowerCase()}`;
}
