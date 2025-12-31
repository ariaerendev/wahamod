import { Processor } from '@nestjs/bullmq';
import { JOB_CONCURRENCY } from '@waha/apps/app_sdk/constants';
import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { SerializeWhatsAppKey } from '@waha/apps/chatwoot/client/ids';
import {
  ChatWootInboxMessageConsumer,
  LookupAndCheckChatId,
} from '@waha/apps/chatwoot/consumers/inbox/base';
import { QueueName } from '@waha/apps/chatwoot/consumers/QueueName';
import { DIContainer } from '@waha/apps/chatwoot/di/DIContainer';
import { WAHASessionAPI } from '@waha/apps/app_sdk/waha/WAHASelf';
import { MessageMappingService } from '@waha/apps/chatwoot/storage';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { RMutexService } from '@waha/modules/rmutex/rmutex.service';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';

@Processor(QueueName.INBOX_MESSAGE_DELETED, { concurrency: JOB_CONCURRENCY })
export class ChatWootInboxMessageDeletedConsumer extends ChatWootInboxMessageConsumer {
  constructor(
    protected readonly manager: SessionManager,
    log: PinoLogger,
    rmutex: RMutexService,
  ) {
    super(manager, log, rmutex, 'ChatWootInboxMessageDeletedConsumer');
  }

  ErrorHeaderKey(): TKey | null {
    return TKey.WHATSAPP_MESSAGE_REMOVING_ERROR;
  }

  protected async Process(container: DIContainer, body, job: Job) {
    const waha = container.WAHASelf();
    const session = new WAHASessionAPI(job.data.session, waha);
    const handler = new MessageDeletedHandler(
      container.MessageMappingService(),
      container.Logger(),
      session,
    );
    return await handler.handle(body);
  }
}

class MessageDeletedHandler {
  constructor(
    private mappingService: MessageMappingService,
    private logger: ILogger,
    private session: WAHASessionAPI,
  ) {}

  async handle(body: any) {
    const chatId = await LookupAndCheckChatId(this.session, body);
    const messages = await this.mappingService.getWhatsAppMessage({
      conversation_id: body.conversation.id,
      message_id: body.id,
    });
    if (!messages || messages.length == 0) {
      if (body.private) {
        // Private notes can have no whatsapp messages
        this.logger.info(
          `No WhatsApp message to delete for private note '${body.id}'`,
        );
        return;
      }
      throw Error(
        `No WhatsApp message found for Chatwoot message '${body.id}'`,
      );
    }

    const session = this.session;
    for (const whatsapp of messages) {
      this.logger.debug(
        `Deleting message '${whatsapp.message_id}' from '${whatsapp.chat_id}'`,
      );
      const messageId = SerializeWhatsAppKey(whatsapp);
      await session.deleteMessage(chatId, messageId);
      this.logger.info(
        `Message '${whatsapp.message_id}' deleted from '${whatsapp.chat_id}'`,
      );
    }
  }
}
