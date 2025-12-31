import * as NodeCache from 'node-cache';

export class PresenceProxy {
  private cache: NodeCache;

  public proxy: Record<string, any>;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 60, // 1 minute
      checkperiod: 60, // 1 minute
      useClones: false,
    });

    this.proxy = new Proxy(
      {},
      {
        get: (_, prop: string) => {
          return this.cache.get(prop);
        },

        set: (_, prop: string, value) => {
          this.cache.set(prop, value);
          return true;
        },

        deleteProperty: (_, prop: string) => {
          return this.cache.del(prop) > 0;
        },

        has: (_, prop: string) => {
          return this.cache.has(prop);
        },

        ownKeys: () => {
          return this.cache.keys();
        },

        getOwnPropertyDescriptor: (_, prop: string) => {
          if (this.cache.has(prop)) {
            return {
              enumerable: true,
              configurable: true,
            };
          }
          return undefined;
        },
      },
    );
  }
}
