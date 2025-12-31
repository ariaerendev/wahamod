import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { ChatWootMessagePartial } from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { PixTemplatePayload, TKey } from '@waha/apps/chatwoot/i18n/templates';
import { MessageToChatWootConverter } from '@waha/apps/chatwoot/messages/to/chatwoot';
import { isEmptyString } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/text';
import { WhatsappToMarkdown } from '@waha/apps/chatwoot/messages/to/chatwoot/utils/markdown';
import * as lodash from 'lodash';
import type { proto } from '@adiwajshing/baileys';
import { WAMessage } from '@waha/structures/responses.dto';

export class PixMessage implements MessageToChatWootConverter {
  constructor(
    private readonly l: Locale,
    private readonly logger: ILogger,
  ) {}

  convert(
    payload: WAMessage,
    protoMessage: proto.Message | null,
  ): ChatWootMessagePartial | null {
    if (!protoMessage) {
      return null;
    }
    const pixData = this.extractPixData(protoMessage);
    if (!pixData) {
      return null;
    }

    const content = this.l.key(TKey.WA_TO_CW_MESSAGE_PIX).r({
      payload: payload,
      message: protoMessage,
      pixData: pixData,
    });

    if (isEmptyString(content)) {
      return null;
    }

    return {
      content: WhatsappToMarkdown(content),
      attachments: [],
      private: undefined,
    };
  }

  private extractPixData(
    protoMessage: proto.Message,
  ): PixTemplatePayload | null {
    const buttons = this.resolveNativeFlowButtons(protoMessage);
    if (!buttons || buttons.length === 0) {
      return null;
    }

    const paymentButton = buttons.find(
      (button) => button?.name === 'payment_info' && button?.buttonParamsJson,
    );

    if (!paymentButton?.buttonParamsJson) {
      return null;
    }

    let params: any;
    try {
      params = JSON.parse(paymentButton.buttonParamsJson);
    } catch (error) {
      this.logger.warn(`Failed to parse PIX button params: ${error}`);
      return null;
    }

    const pixSettings = params?.payment_settings?.find(
      (setting: any) => setting?.type === 'pix_static_code',
    );
    const pixCode = pixSettings?.pix_static_code;
    if (!pixCode) {
      return null;
    }

    const totalAmountFormatted = this.l.FormatCurrency(
      params?.currency,
      params?.total_amount?.value,
      params?.total_amount?.offset,
    );
    const data: PixTemplatePayload = {
      merchantName: pixCode.merchant_name,
      key: pixCode.key,
      keyType: pixCode.key_type,
      currency: params?.currency,
      totalAmount: params?.total_amount?.value,
      totalAmountFormatted: totalAmountFormatted,
      referenceId: params?.reference_id,
    };

    if (lodash.isEmpty(data)) {
      return null;
    }
    return data;
  }

  private resolveNativeFlowButtons(
    protoMessage: proto.Message,
  ):
    | proto.Message.InteractiveMessage.NativeFlowMessage.INativeFlowButton[]
    | null {
    let interactiveMessage: proto.Message.IInteractiveMessage =
      protoMessage?.interactiveMessage;
    if (lodash.isEmpty(interactiveMessage)) {
      return null;
    }
    // GOWS has weird oneOf protobuf behaviour,
    // so we need to double interactiveMessage
    if (
      !lodash.isEmpty(
        (interactiveMessage as proto.Message.InteractiveMessage)
          .interactiveMessage,
      )
    ) {
      interactiveMessage = (
        interactiveMessage as proto.Message.InteractiveMessage
      ).interactiveMessage as proto.Message.IInteractiveMessage;
    }
    return interactiveMessage?.nativeFlowMessage?.buttons;
  }
}
