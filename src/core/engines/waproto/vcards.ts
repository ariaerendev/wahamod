import type { proto } from '@adiwajshing/baileys';
import * as lodash from 'lodash';

export function extractVCards(waproto: proto.Message): string[] | null {
  if (!waproto) {
    return null;
  }
  if (!lodash.isEmpty(waproto.contactMessage)) {
    return [waproto.contactMessage.vcard];
  }

  if (!lodash.isEmpty(waproto.contactsArrayMessage)) {
    return waproto.contactsArrayMessage.contacts.map(
      (contact) => contact.vcard,
    );
  }
  return null;
}
