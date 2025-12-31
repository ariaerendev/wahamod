import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';
import { isEmptyString } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/text';
import { WhatsappToMarkdown } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/markdown';
import * as lodash from 'lodash';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';

export class ListMessage implements MessageToChatWootConverter {
  constructor(private readonly locale: Locale) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    const listMessage = protoMessage?.listMessage;
    if (lodash.isEmpty(listMessage)) {
      return null;
    }

    const content = this.locale
      .key(TKey.WA_TO_CW_MESSAGE_LIST)
      .r({ payload, message: protoMessage as proto.Message });

    if (isEmptyString(content)) {
      return null;
    }

    return {
      content: WhatsappToMarkdown(content),
      attachments: [],
      private: undefined,
    };
  }
}
