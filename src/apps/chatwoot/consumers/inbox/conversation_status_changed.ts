import { Processor } from '@nestjs/bullmq';
import { JOB_CONCURRENCY } from '@waha/apps/app_sdk/constants';
import { QueueName } from '@waha/apps/chatwoot/consumers/QueueName';
import { ChatWootInboxMessageConsumer } from '@waha/apps/chatwoot/consumers/inbox/base';
import { Job } from 'bullmq';
import { DIContainer } from '../../di/DIContainer';
import { TKey } from '../../i18n/templates';
import { ContactConversationService } from '@waha/apps/chatwoot/client/ContactConversationService';
import { AttributeKey } from '@waha/apps/chatwoot/const';
import { ConversationSelector } from '@waha/apps/chatwoot/services/ConversationSelector';
import { GetAllChatIDs } from '@waha/apps/chatwoot/client/ids';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { PinoLogger } from 'nestjs-pino';
import { RMutexService } from '@waha/modules/rmutex';

@Processor(QueueName.INBOX_CONVERSATION_STATUS_CHANGED, {
  concurrency: JOB_CONCURRENCY,
})
export class ChatWootConversationStatusChangedConsumer extends ChatWootInboxMessageConsumer {
  constructor(
    protected readonly manager: SessionManager,
    log: PinoLogger,
    rmutex: RMutexService,
  ) {
    super(manager, log, rmutex, 'ChatWootConversationStatusChangedConsumer');
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
    const handler = new ConversationStatusChangedHandler(
      container.ContactConversationService(),
      container.ConversationSelector(),
    );
    return await handler.handle(body);
  }
}

class ConversationStatusChangedHandler {
  constructor(
    private service: ContactConversationService,
    private selector: ConversationSelector,
  ) {}

  async handle(body) {
    if (!this.selector.hasStatusFilter()) {
      return;
    }
    const ids = GetAllChatIDs(body.meta?.sender);
    this.service.ResetCache(ids);
  }
}
