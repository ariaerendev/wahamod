import type { WAMessage } from '@adiwajshing/baileys';
import type { LabelAssociation } from '@adiwajshing/baileys/lib/Types/LabelAssociation';

export const NowebMessagesMetadata = new Map()
  .set('jid', (msg: WAMessage) => msg.key.remoteJid)
  .set('id', (msg: WAMessage) => msg.key.id)
  .set('messageTimestamp', (msg: WAMessage) => msg.messageTimestamp);

export const NowebLabelAssociationsMetadata = new Map().set(
  'id',
  (a: LabelAssociation) =>
    // @ts-ignore
    `${a.type}_${a.labelId}_${a.chatId}_${a.messageId}`,
);
