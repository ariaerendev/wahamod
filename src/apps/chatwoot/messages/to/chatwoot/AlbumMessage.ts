import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { isEmptyString } from './utils/text';
import * as lodash from 'lodash';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';

export class AlbumMessage implements MessageToChatWootConverter {
  constructor(private readonly locale: Locale) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    // Check if it's an album message
    const isAlbumMessage =
      payload._data?.Info?.MediaType === 'collection' ||
      !lodash.isEmpty(protoMessage?.albumMessage);

    if (!isAlbumMessage) {
      return null;
    }

    // Extract album information
    const albumInfo = protoMessage?.albumMessage;
    const expectedImageCount = albumInfo?.expectedImageCount || 0;
    const expectedVideoCount = albumInfo?.expectedVideoCount || 0;

    const content = this.locale.key(TKey.WA_TO_CW_MESSAGE_ALBUM).r({
      expectedImageCount,
      expectedVideoCount,
      totalCount: expectedImageCount + expectedVideoCount,
    });

    return {
      content,
      attachments: [],
      private: undefined,
    };
  }
}
