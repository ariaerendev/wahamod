// Original '@figuro/chatwoot-sdk'
// Doesn't have the right types for  client.client
// So we defined it here
import { ContactsApi } from '@figuro/chatwoot-sdk/dist/services/client/Contacts';
import { ConversationsApi } from '@figuro/chatwoot-sdk/dist/services/client/Conversations';
import { MessagesApi } from '@figuro/chatwoot-sdk/dist/services/client/Messages';

export interface ChatWootInboxAPI {
  contacts: ContactsApi;
  conversations: ConversationsApi;
  messages: MessagesApi;
}

export interface ChatWootAccountAPIConfig {
  url: string;
  accountId: number;
  accountToken: string;
}

export interface ChatWootInboxAPIConfig {
  url: string;
  inboxId: number;
  inboxIdentifier: string;
}

export interface ChatWootAPIConfig
  extends ChatWootAccountAPIConfig,
    ChatWootInboxAPIConfig {}
