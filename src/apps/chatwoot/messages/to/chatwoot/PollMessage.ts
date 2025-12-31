import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { PollCreationMessage, TKey } from '@waha/apps/chatwoot/i18n/templates';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';
import { isEmptyString } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/text';
import { WhatsappToMarkdown } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/markdown';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';
import * as lodash from 'lodash';

export class PollMessage implements MessageToChatWootConverter {
  constructor(private readonly locale: Locale) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    let poll: PollCreationMessage = null;
    if (!lodash.isEmpty(protoMessage?.pollCreationMessage)) {
      poll = protoMessage.pollCreationMessage;
    }
    if (!lodash.isEmpty(protoMessage?.pollCreationMessageV2)) {
      poll = protoMessage.pollCreationMessageV2;
    }
    if (!lodash.isEmpty(protoMessage?.pollCreationMessageV3)) {
      poll = protoMessage.pollCreationMessageV3;
    }
    if (!poll) {
      return null;
    }

    const content = this.locale
      .key(TKey.WA_TO_CW_MESSAGE_POLL)
      .r({ payload: payload, poll: poll, message: protoMessage });

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
