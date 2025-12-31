import { InjectFlowProducer, InjectQueue, Processor } from '@nestjs/bullmq';
import { JOB_CONCURRENCY } from '@waha/apps/app_sdk/constants';
import { ChatWootInboxMessageConsumer } from '@waha/apps/chatwoot/consumers/inbox/base';
import {
  FlowProducerName,
  QueueName,
} from '@waha/apps/chatwoot/consumers/QueueName';
import { DIContainer } from '@waha/apps/chatwoot/di/DIContainer';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { RMutexService } from '@waha/modules/rmutex/rmutex.service';
import { FlowProducer, Job, Queue } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { CommandPrefix, runText } from '@waha/apps/chatwoot/cli';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { IsCommandsChat } from '@waha/apps/chatwoot/client/ids';
import { QueueRegistry } from '@waha/apps/chatwoot/services/QueueRegistry';

@Processor(QueueName.INBOX_COMMANDS, { concurrency: JOB_CONCURRENCY })
export class ChatWootInboxCommandsConsumer extends ChatWootInboxMessageConsumer {
  constructor(
    protected readonly manager: SessionManager,
    log: PinoLogger,
    rmutex: RMutexService,
    private readonly queueRegistry: QueueRegistry,
    @InjectFlowProducer(FlowProducerName.MESSAGES_PULL_FLOW)
    private readonly messagesPullFlow: FlowProducer,
  ) {
    super(manager, log, rmutex, 'ChatWootInboxCommandsConsumer');
  }

  ErrorHeaderKey(): TKey | null {
    return null;
  }

  protected conversationForReport(container, body) {
    const conversation = super.conversationForReport(container, body);
    if (!IsCommandsChat(body)) {
      conversation.forceNote();
    }
    return conversation;
  }

  protected async Process(container: DIContainer, body, job: Job) {
    let cmd = body.content;
    cmd = cmd.startsWith(CommandPrefix) ? cmd.slice(CommandPrefix.length) : cmd;
    this.logger.info(
      `Executing command '${cmd}' for session ${job.data.session}...`,
    );
    const repo = container.ContactConversationService();
    let conversation = repo.ConversationById(body.conversation.id);
    if (!IsCommandsChat(body)) {
      conversation.forceNote();
    }
    const ctx: CommandContext = {
      data: job.data,
      logger: this.logger,
      l: container.Locale(),
      waha: container.WAHASelf(),
      conversation: conversation,
      queues: {
        registry: this.queueRegistry,
        contactsPull: this.queueRegistry.queue(QueueName.TASK_CONTACTS_PULL),
        messagesPull: this.queueRegistry.queue(QueueName.TASK_MESSAGES_PULL),
      },
      flows: {
        messagesPull: this.messagesPullFlow,
      },
    };
    const commands = container.ChatWootConfig().commands;
    const output = await runText(commands, ctx, cmd);
    if (output.out) {
      await conversation.incoming(output.out);
    }
    if (output.err) {
      await conversation.incoming(output.err);
    }
  }
}
