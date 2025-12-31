import { WAHASelf } from '@waha/apps/app_sdk/waha/WAHASelf';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { Conversation } from '../client/Conversation';
import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { FlowProducer, Queue } from 'bullmq';
import { InboxData } from '@waha/apps/chatwoot/consumers/types';
import { QueueRegistry } from '@waha/apps/chatwoot/services/QueueRegistry';

export interface CommandContext {
  data: InboxData;
  logger: ILogger;
  l: Locale;
  waha: WAHASelf;
  conversation: Conversation;
  queues: {
    registry: QueueRegistry;
    contactsPull: Queue;
    messagesPull: Queue;
  };
  flows: {
    messagesPull: FlowProducer;
  };
}
