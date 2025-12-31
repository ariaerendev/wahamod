import type { WAHAWebhookMessageAck } from '@waha/structures/webhooks.dto';
import { isJidCusFormat } from '@waha/utils/wa';
import { WAMessageAck } from '@waha/structures/enums.dto';
import { isLidUser, toCusFormat } from '@waha/core/utils/jids';
import { EngineHelper } from '@waha/apps/chatwoot/waha';

export function ShouldMarkAsReadInChatWoot(
  event: WAHAWebhookMessageAck,
): boolean {
  // Mark as seen only if it's DM
  // Ignore groups and other multiple participants chats
  const chatId = EngineHelper.ChatID(event.payload);
  if (!isJidCusFormat(chatId) && !isLidUser(chatId)) {
    return false;
  }

  const payload = event.payload;
  // Only READ and PLAYED
  const read = payload.ack === WAMessageAck.READ;
  const played = payload.ack == WAMessageAck.PLAYED;
  if (!read && !played) {
    return false;
  }

  // Only process when OUR message (fromMe: true) was read by recipient
  if (!payload.fromMe) {
    return false;
  }

  // Mark ChatWoot conversation as read when recipient reads our message
  return true;
}
