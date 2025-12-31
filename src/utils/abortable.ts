/**
 * Convert an AbortSignal into a Promise that rejects when aborted.
 *
 * Example:
 *   const signal = AbortSignal.timeout(5000);
 *   await Promise.race([
 *     slowOperation(signal),
 *     SignalToPromise(signal),
 *   ]);
 */
export function SignalToPromise(signal: AbortSignal): Promise<never> {
  signal.throwIfAborted();
  return new Promise((_, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(
        signal.reason instanceof DOMException
          ? signal.reason
          : new DOMException('The operation was aborted', 'AbortError'),
      );
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Race an already-started promise against an AbortSignal.
 * The promise settles normally unless the signal aborts first.
 *
 * Example:
 *   const signal = AbortSignal.any([
 *     AbortSignal.timeout(10_000),
 *     controller.signal,
 *   ]);
 *
 *   await SignalRace(doSomethingAsync(args, signal), signal);
 */
export function SignalRace<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  signal.throwIfAborted();
  return Promise.race([promise, SignalToPromise(signal)]);
}
