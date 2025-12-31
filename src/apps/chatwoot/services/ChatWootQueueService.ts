import { Injectable } from '@nestjs/common';
import { EventName } from '@waha/apps/chatwoot/client/types';
import { InboxData } from '@waha/apps/chatwoot/consumers/types';
import { Queue } from 'bullmq';

import { QueueName } from '../consumers/QueueName';
import { QueueRegistry } from './QueueRegistry';

/**
 * Service for managing ChatWoot queues for inbox events
 * This service is used to centralize queue configuration and job options
 */
@Injectable()
export class ChatWootQueueService {
  constructor(private readonly queueRegistry: QueueRegistry) {}

  /**
   * Generic method to add a job to a queue
   * @param queue The queue to add the job to
   * @param name The name of the job
   * @param data The data for the job
   * @returns The result of adding the job to the queue
   */
  async add(queue: Queue, name: string, data: any): Promise<any> {
    return await queue.add(name, data);
  }

  /**
   * Get the specific queue for an event
   * @param event The event to get the queue for
   * @returns The queue for the event, or null if there is no specific queue
   */
  private getQueueForEvent(event: string): Queue | null {
    switch (event) {
      case EventName.CONVERSATION_CREATED:
        return this.queueRegistry.queue(QueueName.INBOX_CONVERSATION_CREATED);
      case EventName.MESSAGE_CREATED:
        return this.queueRegistry.queue(QueueName.INBOX_MESSAGE_CREATED);
      case EventName.MESSAGE_UPDATED:
        return this.queueRegistry.queue(QueueName.INBOX_MESSAGE_UPDATED);
      case EventName.CONVERSATION_STATUS_CHANGED:
        return this.queueRegistry.queue(
          QueueName.INBOX_CONVERSATION_STATUS_CHANGED,
        );
      case 'message_deleted':
        return this.queueRegistry.queue(QueueName.INBOX_MESSAGE_DELETED);
      case 'commands':
        return this.queueRegistry.queue(QueueName.INBOX_COMMANDS);
      default:
        return null;
    }
  }

  /**
   * Add a job to the message created queue
   */
  async addMessageCreatedJob(data: InboxData): Promise<any> {
    return await this.add(
      this.queueRegistry.queue(QueueName.INBOX_MESSAGE_CREATED),
      EventName.MESSAGE_CREATED,
      data,
    );
  }

  /**
   * Add a job to the message updated queue
   */
  async addMessageUpdatedJob(data: InboxData): Promise<any> {
    return await this.add(
      this.queueRegistry.queue(QueueName.INBOX_MESSAGE_UPDATED),
      EventName.MESSAGE_UPDATED,
      data,
    );
  }

  /**
   * Add a job to the message deleted queue
   */
  async addMessageDeletedJob(data: InboxData): Promise<any> {
    return await this.add(
      this.queueRegistry.queue(QueueName.INBOX_MESSAGE_DELETED),
      'message_deleted',
      data,
    );
  }

  /**
   * Add a job to the commands queue
   */
  async addCommandsJob(event: string, data: InboxData): Promise<any> {
    return await this.add(
      this.queueRegistry.queue(QueueName.INBOX_COMMANDS),
      event,
      data,
    );
  }

  /**
   * Add a job to the appropriate queue based on the event
   */
  async addJobToQueue(event: string, data: InboxData): Promise<any> {
    const queue = this.getQueueForEvent(event);
    if (!queue) {
      return;
    }
    await this.add(queue, event, data);
  }
}
