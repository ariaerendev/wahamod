import { normalizeJid } from '@waha/core/utils/jids';

type RewriteRule = {
  name: string;
  re: RegExp;
  replace: string;
};

/**
 * Convert JID to Phone Number if possible
 * Applies some formatting rules
 */
export class PhoneJidNormalizer {
  constructor(private rules: RewriteRule[] = []) {}

  /**
   * jid like "553188888888@s.whatsapp.net" → "+553188888888"
   */
  private parseFromJid(jid: string): string | null {
    if (!jid) {
      return null;
    }
    jid = normalizeJid(jid);
    const local = jid.split('@', 1)[0] ?? '';
    if (!local) {
      return null;
    }
    return `+${local}`;
  }

  /**
   * Apply rewrite rules
   */
  private rewrite(number: string): string {
    for (const rule of this.rules) {
      if (rule.re.test(number)) {
        number = number.replace(rule.re, rule.replace);
        return number;
      }
    }
    return number;
  }

  /**
   * Converts a JID (Jabber ID) into an E.164 formatted phone number string.
   * Applies rules if any
   */
  fromJid(jid: string): string | null {
    let number = this.parseFromJid(jid);
    if (!number) {
      return null;
    }
    number = this.rewrite(number);
    return number;
  }
}

const RULES = [
  // Brazil - ensure mobile numbers have 9 digits after DDD
  {
    name: 'br-add-9-after-ddd',
    re: /^\+55(\d{2})(\d{8})$/,
    replace: '+55$19$2',
  },
];

export const E164Parser = new PhoneJidNormalizer(RULES);
