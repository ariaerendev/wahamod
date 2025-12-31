import { Processor } from '@nestjs/bullmq';
import { JOB_CONCURRENCY } from '@waha/apps/app_sdk/constants';
import { QueueName } from '@waha/apps/chatwoot/consumers/QueueName';
import { ChatWootConversationKey } from '@waha/apps/chatwoot/consumers/mutex';
import { ChatWootInboxMessageConsumer } from '@waha/apps/chatwoot/consumers/inbox/base';
import { InboxData } from '@waha/apps/chatwoot/consumers/types';
import { Job } from 'bullmq';
import { GetAllChatIDs } from '@waha/apps/chatwoot/client/ids';
import { DIContainer } from '@waha/apps/chatwoot/di/DIContainer';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { ContactConversationService } from '@waha/apps/chatwoot/client/ContactConversationService';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { PinoLogger } from 'nestjs-pino';
import { RMutexService } from '@waha/modules/rmutex';

@Processor(QueueName.INBOX_CONVERSATION_CREATED, {
  concurrency: JOB_CONCURRENCY,
})
export class ChatWootConversationCreatedConsumer extends ChatWootInboxMessageConsumer {
  constructor(
    protected readonly manager: SessionManager,
    log: PinoLogger,
    rmutex: RMutexService,
  ) {
    super(manager, log, rmutex, 'ChatWootConversationCreatedConsumer');
  }
  protected ErrorHeaderKey(): TKey | null {
    return null;
  }

  protected GetConversationID(body) {
    return body.id;
  }

  protected async Process(
    container: DIContainer,
    body: any,
    job: Job,
  ): Promise<any> {
    const handler = new ConversationCreatedHandler(
      container.ContactConversationService(),
    );
    return handler.handle(body);
  }
}

class ConversationCreatedHandler {
  constructor(private service: ContactConversationService) {}

  async handle(body: any) {
    const ids = GetAllChatIDs(body?.meta?.sender);
    if (!ids || ids.length === 0) {
      return;
    }
    this.service.ResetMismatchedCache(ids, body.id);
  }
}
