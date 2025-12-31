/**
 * If value is ms - we convert it to seconds
 */
export function EnsureSeconds(ms: number) {
  if (!ms) {
    return ms;
  }
  if (ms >= 1e12) {
    return Math.floor(ms / 1000);
  }
  return ms;
}
export function EnsureMilliseconds(seconds: number) {
  if (!seconds) {
    return seconds;
  }
  if (seconds < 1e12) {
    return seconds * 1000;
  }
  return seconds;
}
