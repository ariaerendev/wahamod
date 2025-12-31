import { ChatWootAPIConfig } from '@waha/apps/chatwoot/client/interfaces';
import * as NodeCache from 'node-cache';

import { IConversationCache } from './IConversationCache';
import { ContactIds } from '@waha/apps/chatwoot/client/ConversationService';

const cache: NodeCache = new NodeCache({
  stdTTL: 24 * 60 * 60, // 1 day
  useClones: false,
});

export function CacheForConfig(config: ChatWootAPIConfig): ConversationCache {
  return new ConversationCache(`${config.url}+${config.inboxId}`);
}

class ConversationCache implements IConversationCache {
  constructor(private prefix: string) {}

  private fullKey(key: string) {
    return `${this.prefix}.${key}`;
  }

  delete(key: string): void {
    const fullKey = this.fullKey(key);
    cache.del(fullKey);
  }

  get(key: string): ContactIds | null {
    const fullKey = this.fullKey(key);
    return cache.get(fullKey) || null;
  }

  has(key: string): boolean {
    const fullKey = this.fullKey(key);
    return cache.has(fullKey);
  }

  set(key: string, value: ContactIds): void {
    const fullKey = this.fullKey(key);
    cache.set(fullKey, value);
  }

  /**
   * Completely clean the cache with the prefix
   */
  clean() {
    cache.keys().forEach((key) => {
      if (key.startsWith(this.prefix)) {
        cache.del(key);
      }
    });
  }
}
