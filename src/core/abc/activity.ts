import type { WhatsappSession } from '@waha/core/abc/session.abc';

/**
 * Decorator to mark a method as an activity that
 * keeps the WhatsApp session online.
 * @constructor
 */
export function Activity() {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: WhatsappSession,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const original = descriptor.value!;
    descriptor.value = async function (
      this: WhatsappSession,
      ...args: Parameters<T>
    ): Promise<ReturnType<T>> {
      await this.maintainPresenceOnline();
      return await original.apply(this, args);
    } as T;

    return descriptor;
  };
}
