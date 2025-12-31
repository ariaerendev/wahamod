import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { SendAttachment } from '@waha/apps/chatwoot/client/types';
import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { parseVCardV3, SimpleVCardInfo } from '@waha/core/vcard';
import * as lodash from 'lodash';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';

export class ShareContactMessage implements MessageToChatWootConverter {
  constructor(
    private readonly locale: Locale,
    private readonly logger: ILogger,
  ) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    void payload;
    const vcards = collectVcards(protoMessage);
    if (vcards.length === 0) {
      return null;
    }

    const attachments: SendAttachment[] = vcards.map((vcard, index) => ({
      content: Buffer.from(vcard, 'utf8').toString('base64'),
      encoding: 'base64',
      filename: `vcard-${index + 1}.vcf`,
    }));

    let contacts: SimpleVCardInfo[] = [];
    try {
      contacts = vcards.map(parseVCardV3);
    } catch (err) {
      this.logger.error(
        `Error parsing some vcards: vcards=${vcards}, err=${err}`,
      );
    }

    if (contacts.length === 0 && attachments.length === 0) {
      return null;
    }

    const content = this.locale
      .key(TKey.WA_TO_CW_MESSAGE_CONTACTS)
      .r({ contacts });

    return {
      content,
      attachments,
      private: undefined,
    };
  }
}

function collectVcards(message: proto.Message | null): string[] {
  if (lodash.isEmpty(message?.contactsArrayMessage?.contacts)) {
    if (!lodash.isEmpty(message?.contactMessage?.vcard)) {
      return [message!.contactMessage!.vcard];
    }
    return [];
  }

  return message!.contactsArrayMessage!.contacts.map(
    (contact) => contact.vcard,
  );
}
