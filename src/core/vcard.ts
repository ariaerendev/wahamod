import { Contact, VCardContact } from '@waha/structures/chatting.dto';
import * as ICAL from 'ical.js';

export function toVcardV3(data: Contact | VCardContact): string {
  if (data.vcard) {
    return data.vcard;
  }
  const contact: Contact = data as any;
  const parts = [];
  parts.push('BEGIN:VCARD');
  parts.push('VERSION:3.0');
  parts.push(`FN:${contact.fullName}`);
  if (contact.organization) {
    parts.push(`ORG:${contact.organization};`);
  }
  if (contact.whatsappId) {
    parts.push(
      `TEL;type=CELL;type=VOICE;waid=${contact.whatsappId}:${contact.phoneNumber}`,
    );
  } else {
    parts.push(`TEL;type=CELL;type=VOICE:${contact.phoneNumber}`);
  }
  parts.push('END:VCARD');
  return parts.join('\n');
}

export interface SimpleVCardInfo {
  fullName: string;
  phoneNumbers: string[];
}

export function parseVCardV3(vcardText: string): SimpleVCardInfo {
  const parsed = (ICAL as any).parse(vcardText);
  const comp = new (ICAL as any).Component(parsed);

  // FN preferred, fallback to N
  let fullName = comp.getFirstPropertyValue('fn') as string | undefined;
  if (!fullName) {
    const n = comp.getFirstPropertyValue('n') as string | undefined;
    if (n) {
      const [family, given, additional, prefix, suffix] = ('' + n).split(';');
      fullName = [prefix, given, additional, family, suffix]
        .filter(Boolean)
        .join(' ')
        .trim();
    }
  }

  // Collect all TEL values
  const phoneNumbers = comp
    .getAllProperties('tel')
    .map((p) => String(p.getFirstValue() ?? ''))
    .filter((n) => n.length > 0);

  return {
    fullName: fullName || '',
    phoneNumbers: phoneNumbers,
  };
}
