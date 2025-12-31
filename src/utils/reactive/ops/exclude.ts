import { filter } from 'rxjs';

/**
 * Just as filter, but opposite
 */
export function exclude<T>(predicate: (...args) => boolean) {
  return filter((...args) => !predicate(...args));
}
