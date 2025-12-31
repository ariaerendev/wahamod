export function WhatsAppChatIdKey(app: string, chatId: string) {
  return `chatwoot.${app}.whatsapp.chat-id-${chatId}`;
}

export function ChatWootConversationKey(app: string, conversationId: string) {
  return `chatwoot.${app}.chatwoot.conversation-id-${conversationId}`;
}
