import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { SendAttachment } from '@waha/apps/chatwoot/client/types';
import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import {
  FacebookAdTemplateData,
  TKey,
} from '@waha/apps/chatwoot/i18n/templates';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';
import { WhatsappToMarkdown } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/markdown';
import { WAMessage } from '@waha/structures/responses.dto';
import type { proto } from '@adiwajshing/baileys';
import * as lodash from 'lodash';

import { fetchBuffer } from '@waha/utils/fetch';

export class FacebookAdMessage implements MessageToChatWootConverter {
  constructor(
    private readonly locale: Locale,
    private readonly logger: ILogger,
  ) {}

  async convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): Promise<ChatWootMessagePartial | null> {
    const adData = this.extractAdData(protoMessage);
    if (!adData) {
      return null;
    }
    const content = this.locale.key(TKey.WA_TO_CW_MESSAGE_FACEBOOK_AD).render({
      payload,
      adData,
    });
    const attachments = await this.getAttachments(adData);

    return {
      content: WhatsappToMarkdown(content),
      attachments,
      private: undefined,
    };
  }

  private extractAdData(protoMessage: proto.Message): FacebookAdTemplateData {
    if (
      lodash.isEmpty(
        protoMessage?.extendedTextMessage?.contextInfo?.externalAdReply,
      )
    ) {
      return null;
    }
    const adReply =
      protoMessage?.extendedTextMessage?.contextInfo?.externalAdReply;
    return {
      title: adReply.title ?? '',
      body: adReply.body ?? '',
      thumbnailUrl: adReply.thumbnailUrl ?? '',
      originalImageUrl: adReply.originalImageUrl ?? '',
      sourceUrl: adReply.sourceUrl ?? '',
      sourceId: adReply.sourceId ?? '',
    };
  }

  private async getAttachments(
    adData: FacebookAdTemplateData,
  ): Promise<SendAttachment[]> {
    const imageUrl = adData.originalImageUrl || adData.thumbnailUrl;
    if (!imageUrl) {
      return [];
    }

    try {
      this.logger.info(`Downloading Facebook Ad image from '${imageUrl}'...`);
      const buffer = await fetchBuffer(imageUrl);
      const attachment: SendAttachment = {
        content: buffer.toString('base64'),
        filename: 'facebook-ad-image.jpg',
        encoding: 'base64',
      };
      this.logger.info(
        `Downloaded Facebook Ad image from '${imageUrl}' as '${attachment.filename}'`,
      );
      return [attachment];
    } catch (error) {
      const reason = error instanceof Error ? error.message : `${error}`;
      this.logger.error(
        `Failed to download Facebook Ad image from '${imageUrl}': ${reason}`,
      );
      return [];
    }
  }
}
