import type { WAMessageKey } from '@adiwajshing/baileys';
import { toJID } from '@waha/core/utils/jids';

/**
 * Parse message id from WAHA to engine
 * false_11111111111@c.us_AAA
 * {id: "AAA", remoteJid: "11111111111@s.whatsapp.net", "fromMe": false}
 */
export function parseMessageIdSerialized(
  messageId: string,
  soft: boolean = false,
): WAMessageKey {
  if (!messageId.includes('_') && soft) {
    return { id: messageId };
  }

  const parts = messageId.split('_');
  if (parts.length != 3 && parts.length != 4) {
    throw new Error(
      'Message id be in format false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA[_participant]',
    );
  }
  const fromMe = parts[0] == 'true';
  const chatId = parts[1];
  const remoteJid = toJID(chatId);
  const id = parts[2];
  const participant = parts[3] ? toJID(parts[3]) : undefined;
  return {
    fromMe: fromMe,
    id: id,
    remoteJid: remoteJid,
    participant: participant,
  };
}

export function SerializeMessageKey(key: WAMessageKey) {
  const { fromMe, id, remoteJid, participant } = key;
  const participantStr = participant ? `_${participant}` : '';
  return `${fromMe ? 'true' : 'false'}_${remoteJid}_${id}${participantStr}`;
}
