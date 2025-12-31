import { conversation_message_create } from '@figuro/chatwoot-sdk';
import { Processor } from '@nestjs/bullmq';
import { JOB_CONCURRENCY } from '@waha/apps/app_sdk/constants';
import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { ContactConversationService } from '@waha/apps/chatwoot/client/ContactConversationService';
import { MessageType } from '@waha/apps/chatwoot/client/types';
import { QueueName } from '@waha/apps/chatwoot/consumers/QueueName';
import { EventData } from '@waha/apps/chatwoot/consumers/types';
import {
  ChatWootWAHABaseConsumer,
  IMessageInfo,
} from '@waha/apps/chatwoot/consumers/waha/base';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import {
  ChatwootMessage,
  MessageMappingService,
} from '@waha/apps/chatwoot/storage';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { RMutexService } from '@waha/modules/rmutex/rmutex.service';
import { WAHAEvents } from '@waha/structures/enums.dto';
import { WAHAWebhookMessageRevoked } from '@waha/structures/webhooks.dto';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { toCusFormat } from '@waha/core/utils/jids';

@Processor(QueueName.WAHA_MESSAGE_REVOKED, { concurrency: JOB_CONCURRENCY })
export class WAHAMessageRevokedConsumer extends ChatWootWAHABaseConsumer {
  constructor(
    protected readonly manager: SessionManager,
    log: PinoLogger,
    rmutex: RMutexService,
  ) {
    super(manager, log, rmutex, 'WAHAMessageRevokedConsumer');
  }

  GetChatId(event: WAHAWebhookMessageRevoked): string {
    return event.payload.after.from;
  }

  async Process(
    job: Job<EventData, any, WAHAEvents>,
    info: IMessageInfo,
  ): Promise<any> {
    const container = await this.DIContainer(job, job.data.app);
    const event: WAHAWebhookMessageRevoked = job.data.event as any;
    const handler = new MessageRevokedHandler(
      container.MessageMappingService(),
      container.ContactConversationService(),
      container.Logger(),
      container.Locale(),
      info,
    );
    return await handler.handle(event);
  }
}

export class MessageRevokedHandler {
  constructor(
    private mappingService: MessageMappingService,
    private repo: ContactConversationService,
    private logger: ILogger,
    private l: Locale,
    private info: IMessageInfo,
  ) {}

  async handle(event: WAHAWebhookMessageRevoked) {
    const payload = event.payload;
    const messageId = event.payload.revokedMessageId;
    const chatId = payload.after.from;
    const chatwoot = await this.mappingService.getChatWootMessage({
      chat_id: toCusFormat(chatId),
      message_id: messageId,
    });
    if (!chatwoot) {
      this.logger.warn('Message not found in mapping service');
      return;
    }
    const conversation = this.repo.ConversationById(chatwoot.conversation_id);
    const message = this.buildChatWootMessage(chatwoot, payload.after.fromMe);
    this.info.onConversationId(chatwoot.conversation_id);
    this.info.onMessageType(message.message_type as MessageType);
    await conversation.send(message);
  }

  private buildChatWootMessage(
    chatwoot: ChatwootMessage,
    fromMe: boolean,
  ): conversation_message_create {
    const content = this.l.key(TKey.MESSAGE_REMOVED_IN_WHATSAPP).render();
    const type = fromMe ? MessageType.OUTGOING : MessageType.INCOMING;
    return {
      content: content,
      message_type: type,
      private: true,
      content_attributes: {
        in_reply_to: chatwoot.message_id,
      },
    };
  }
}
