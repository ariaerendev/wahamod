import ChatwootClient, { contact_conversations } from '@figuro/chatwoot-sdk';
import { ILogger } from '@waha/apps/app_sdk/ILogger';
import {
  ChatWootAPIConfig,
  ChatWootInboxAPI,
} from '@waha/apps/chatwoot/client/interfaces';
import type { conversation } from '@figuro/chatwoot-sdk/dist/models/conversation';
import { ConversationSelector } from '@waha/apps/chatwoot/services/ConversationSelector';
import { ChatWootInboxNewAPI } from '@waha/apps/chatwoot/client/ChatWootInboxNewAPI';

export type ConversationResult = Pick<conversation, 'id' | 'account_id'>;

export interface ContactIds {
  id: number;
  sourceId: string;
}

export class ConversationService {
  constructor(
    private config: ChatWootAPIConfig,
    private accountAPI: ChatwootClient,
    private inboxAPI: ChatWootInboxAPI,
    private selector: ConversationSelector,
    private logger: ILogger,
  ) {}

  public async find(contact: ContactIds): Promise<ConversationResult | null> {
    const result: { payload: contact_conversations } =
      (await this.accountAPI.contacts.listConversations({
        accountId: this.config.accountId,
        id: contact.id,
      })) as any;
    const conversations = result.payload;
    const conversation = this.selector.select(conversations);
    if (conversation) {
      this.logger.debug(
        `Found existing conversation.id: ${conversation.id} for contact.id: ${contact.id}, contact.sourceId: ${contact.sourceId}`,
      );
    }
    return conversation;
  }

  private async create(contact: ContactIds): Promise<ConversationResult> {
    const conversation = await this.inboxAPI.conversations.create({
      inboxIdentifier: this.config.inboxIdentifier,
      contactIdentifier: contact.sourceId,
    });
    this.logger.debug(
      `Created conversation.id: ${conversation.id} for contact.id: ${contact.id}, contact.sourceId: ${contact.sourceId}`,
    );
    return conversation;
  }

  async upsert(contact: ContactIds): Promise<ConversationResult> {
    let conversation = await this.find(contact);
    if (!conversation) {
      conversation = await this.create(contact);
    }
    return conversation;
  }

  async markAsRead(conversationId: number, sourceId: string): Promise<void> {
    try {
      const inboxNewAPI = new ChatWootInboxNewAPI(
        this.config.url,
        this.config.inboxIdentifier,
      );
      await inboxNewAPI.updateLastSeen(sourceId, conversationId);
      this.logger.info(
        `Marked conversation.id: ${conversationId} as read in inbox: ${this.config.inboxIdentifier} for contact: ${sourceId}`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error marking conversation.id: ${conversationId} as read: ${reason}`,
      );
      throw error;
    }
  }

  async resolve(conversationId: number): Promise<any> {
    return this.accountAPI.conversations.toggleStatus({
      accountId: this.config.accountId,
      conversationId: conversationId,
      data: {
        status: 'resolved',
      },
    });
  }
}
