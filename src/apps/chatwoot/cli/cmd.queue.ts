import * as lodash from 'lodash';
import { QueueManager } from '@waha/apps/chatwoot/services/QueueManager';
import { Locale } from '@waha/apps/chatwoot/i18n/locale';
import { Conversation } from '@waha/apps/chatwoot/client/Conversation';
import { QueueRegistry } from '@waha/apps/chatwoot/services/QueueRegistry';
import { QueueNameRepr } from '@waha/apps/app_sdk/JobUtils';

export interface QueueCommandContext {
  queues: {
    registry: QueueRegistry;
  };
  l: Locale;
  conversation: Conversation;
}

export async function QueueStatus(ctx: QueueCommandContext, name: string) {
  const manager = new QueueManager(ctx.queues.registry);
  const names = manager.resolve(name);
  let result = await manager.status(names);
  for (const status of result) {
    status.name = QueueNameRepr(status.name);
  }
  // locked: true - last
  result = lodash.sortBy(result, [(x) => !!x.locked, 'name']);
  const msg = ctx.l.r('cli.cmd.queue.status.result', {
    queues: result,
  });
  await ctx.conversation.incoming(msg);
}

export async function QueueStart(ctx: QueueCommandContext, name: string) {
  const manager = new QueueManager(ctx.queues.registry);
  const names = manager.resolve(name);
  await manager.resume(names);
  const msg = ctx.l.r('cli.cmd.queue.resumed');
  await ctx.conversation.activity(msg);
}

export async function QueueStop(ctx: QueueCommandContext, name?: string) {
  const manager = new QueueManager(ctx.queues.registry);
  const names = manager.resolve(name);
  await manager.pause(names);
  const msg = ctx.l.r('cli.cmd.queue.paused');
  await ctx.conversation.activity(msg);
}
