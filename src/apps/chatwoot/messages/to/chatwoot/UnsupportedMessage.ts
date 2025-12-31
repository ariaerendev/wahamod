import { JobLink } from '@waha/apps/app_sdk/JobUtils';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { Job } from 'bullmq';
import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';

export class UnsupportedMessage implements MessageToChatWootConverter {
  constructor(
    private readonly locale: Locale,
    private readonly job: Job,
  ) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial {
    void payload;
    void protoMessage;
    const content = this.locale
      .key(TKey.WA_TO_CW_MESSAGE_UNSUPPORTED)
      .render({ details: JobLink(this.job) });

    return {
      content,
      attachments: [],
      private: true,
    };
  }
}
