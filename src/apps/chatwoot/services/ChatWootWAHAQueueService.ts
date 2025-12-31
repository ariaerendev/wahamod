import { Injectable } from '@nestjs/common';
import { ListenEventsForChatWoot } from '@waha/apps/chatwoot/consumers/waha/base';
import { populateSessionInfo } from '@waha/core/abc/manager.abc';
import { WhatsappSession } from '@waha/core/abc/session.abc';
import { WAHAEvents } from '@waha/structures/enums.dto';
import { Queue } from 'bullmq';

import { QueueName } from '../consumers/QueueName';
import { QueueRegistry } from './QueueRegistry';
import { App } from '@waha/apps/app_sdk/dto/app.dto';
import { ChatWootAppConfig } from '@waha/apps/chatwoot/dto/config.dto';
import { ChatWootConfigDefaults } from '@waha/apps/chatwoot/di/DIContainer';

/**
 * Service for managing ChatWoot queues for WAHA events
 * This service is used to avoid cycle dependency between ChatWoot module and SessionManager
 */
@Injectable()
export class ChatWootWAHAQueueService {
  constructor(private readonly queueRegistry: QueueRegistry) {}

  /**
   * Get the specific queue for an event
   * @param event The event to get the queue for
   * @returns The queue for the event, or null if there is no specific queue
   */
  private getQueueForEvent(event: WAHAEvents): Queue | null {
    switch (event) {
      case WAHAEvents.MESSAGE_ANY:
        return this.queueRegistry.queue(QueueName.WAHA_MESSAGE_ANY);
      case WAHAEvents.MESSAGE_REACTION:
        return this.queueRegistry.queue(QueueName.WAHA_MESSAGE_REACTION);
      case WAHAEvents.MESSAGE_EDITED:
        return this.queueRegistry.queue(QueueName.WAHA_MESSAGE_EDITED);
      case WAHAEvents.MESSAGE_REVOKED:
        return this.queueRegistry.queue(QueueName.WAHA_MESSAGE_REVOKED);
      case WAHAEvents.MESSAGE_ACK:
        return this.queueRegistry.queue(QueueName.WAHA_MESSAGE_ACK);
      case WAHAEvents.SESSION_STATUS:
        return this.queueRegistry.queue(QueueName.WAHA_SESSION_STATUS);
      case WAHAEvents.CALL_RECEIVED:
        return this.queueRegistry.queue(QueueName.WAHA_CALL_RECEIVED);
      case WAHAEvents.CALL_ACCEPTED:
        return this.queueRegistry.queue(QueueName.WAHA_CALL_ACCEPTED);
      case WAHAEvents.CALL_REJECTED:
        return this.queueRegistry.queue(QueueName.WAHA_CALL_REJECTED);
      default:
        return null;
    }
  }

  /**
   * Add a job to the queue for an event
   */
  private async addJobToQueue(
    event: WAHAEvents,
    data: any,
    appId: string,
  ): Promise<void> {
    const queue = this.getQueueForEvent(event);
    if (queue) {
      await queue.add(data.event, { app: appId, event: data });
    }
  }

  /**
   * Configure ChatWoot event handling for a session
   */
  listenEvents(app: App<ChatWootAppConfig>, session: WhatsappSession): void {
    const config = ChatWootConfigDefaults(app.config);
    const events = ListenEventsForChatWoot(config);
    for (const event of events) {
      const obs$ = session.getEventObservable(event);
      obs$.subscribe(async (payload) => {
        const data = populateSessionInfo(event, session)(payload);
        await this.addJobToQueue(event, data, app.id);
      });
    }
  }
}
