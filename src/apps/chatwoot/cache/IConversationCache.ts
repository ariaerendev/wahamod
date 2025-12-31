import { ContactIds } from '@waha/apps/chatwoot/client/ConversationService';

export interface IConversationCache {
  get(key: string): ContactIds | null;
  set(key: string, value: ContactIds): void;
  has(key: string): boolean;
  delete(key: string): void;
  clean(): void;
}
