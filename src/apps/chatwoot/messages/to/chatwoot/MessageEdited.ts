import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';
import { WAMessage } from '@waha/structures/responses.dto';
import type { proto } from '@adiwajshing/baileys';
import { WhatsappToMarkdown } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/markdown';

export class MessageEdited implements MessageToChatWootConverter {
  constructor(private readonly locale: Locale) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    void protoMessage;
    const formatted = WhatsappToMarkdown(payload.body);
    const content = this.locale
      .key(TKey.MESSAGE_EDITED_IN_WHATSAPP)
      .render({ text: formatted });

    return {
      content,
      attachments: [],
      private: undefined,
    };
  }
}
