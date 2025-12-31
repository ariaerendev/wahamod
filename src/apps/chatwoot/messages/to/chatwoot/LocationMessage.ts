import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { isEmptyString } from './utils/text';
import * as lodash from 'lodash';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';

export class LocationMessage implements MessageToChatWootConverter {
  constructor(private readonly locale: Locale) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    const hasLocation = !lodash.isEmpty(protoMessage?.locationMessage);
    const hasLiveLocation = !lodash.isEmpty(protoMessage?.liveLocationMessage);
    if (!hasLocation && !hasLiveLocation) {
      return null;
    }

    const content = this.locale
      .key(TKey.WA_TO_CW_MESSAGE_LOCATION)
      .r({ payload, message: protoMessage });

    if (isEmptyString(content)) {
      return null;
    }

    return {
      content,
      attachments: [],
      private: undefined,
    };
  }
}
