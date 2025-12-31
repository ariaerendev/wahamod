export function CacheAsync() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    const symbol = Symbol(`__cache_${propertyKey}`);

    descriptor.value = async function (...args: any[]) {
      const key = symbol;

      if (this[key]) {
        return this[key];
      }

      const result = await original.apply(this, args);
      this[key] = result;
      return result;
    };
  };
}

export function CacheSync() {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value as (...args: any[]) => any;
    if (typeof original !== 'function') {
      throw new Error('@CacheSync can only decorate methods');
    }

    const symbol = Symbol(`__cache_${propertyKey}`);

    descriptor.value = function (...args: any[]) {
      if (Object.prototype.hasOwnProperty.call(this, symbol)) {
        return (this as any)[symbol];
      }
      const result = original.apply(this, args);
      Object.defineProperty(this, symbol, {
        value: result,
        enumerable: false,
        configurable: false,
        writable: false,
      });
      return result;
    };

    return descriptor;
  };
}
