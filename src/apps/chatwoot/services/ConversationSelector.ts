import { ConversationStatus } from '@waha/apps/chatwoot/client/types';
import { contact_conversations } from '@figuro/chatwoot-sdk/dist/models/contact_conversations';
import * as lodash from 'lodash';
import type { conversation } from '@figuro/chatwoot-sdk/dist/models/conversation';

export enum ConversationSort {
  activity_newest = 'activity_newest',
  created_newest = 'created_newest',
  created_oldest = 'created_oldest',
  activity_oldest = 'activity_oldest',
}

export type ConversationSelectorConfig = {
  sort: ConversationSort;
  status?: Array<ConversationStatus>;
  inboxId: number;
};

export type ConversationResult = Pick<conversation, 'id' | 'account_id'>;

export class ConversationSelector {
  constructor(private config: ConversationSelectorConfig) {}

  hasStatusFilter() {
    return this.config.status;
  }

  select(conversations: contact_conversations): ConversationResult | null {
    conversations = this.filter(conversations);
    conversations = this.sort(conversations);
    return conversations[0] || null;
  }

  private filter(conversations: contact_conversations): contact_conversations {
    // Filter by inbox id
    conversations = lodash.filter(conversations, {
      inbox_id: this.config.inboxId,
    }) as contact_conversations;

    // Filter by status
    if (this.config.status && this.config.status.length > 0) {
      conversations = lodash.filter(conversations, (conversation) => {
        return this.config.status.includes(
          conversation.status as ConversationStatus,
        );
      });
    }
    return conversations;
  }

  private sort(conversations: contact_conversations): contact_conversations {
    let field = null;
    let dir = null;
    switch (this.config.sort) {
      case ConversationSort.activity_newest:
        [field, dir] = ['last_activity_at', 'desc'];
        break;
      case ConversationSort.created_newest:
        [field, dir] = ['created_at', 'desc'];
        break;
      case ConversationSort.created_oldest:
        [field, dir] = ['created_at', 'asc'];
        break;
      case ConversationSort.activity_oldest:
        [field, dir] = ['last_activity_at', 'asc'];
    }
    if (!field || !dir) {
      return conversations;
    }
    return lodash.orderBy(conversations, [field], [dir]);
  }
}
