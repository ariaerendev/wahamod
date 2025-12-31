import { WAHAWebhook } from '@waha/structures/webhooks.dto';

export interface InboxData {
  session: string;
  app: string;
  body: any;
}

export interface EventData {
  app: string;
  event: WAHAWebhook;
}

export interface ScheduledData {
  app: string;
  session: string;
}
