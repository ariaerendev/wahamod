import * as lodash from 'lodash';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { QueueName } from '@waha/apps/chatwoot/consumers/QueueName';
import {
  ChatID,
  MessagesPullOptions,
  MessagesPullStatusMessage,
  TaskActivity,
} from '@waha/apps/chatwoot/consumers/task/messages.pull';
import { ChatWootScheduleService } from '@waha/apps/chatwoot/services/ChatWootScheduleService';
import { ILogger } from '@waha/apps/app_sdk/ILogger';
import { JobDataTimeout } from '@waha/apps/app_sdk/AppConsumer';
import { FlowProducer, Job, JobsOptions, Queue } from 'bullmq';
import { FlowJob } from 'bullmq/dist/esm/interfaces';
import { GetAllChatIDs, IsCommandsChat } from '@waha/apps/chatwoot/client/ids';
import { ChainJobsOneAtATime } from '@waha/apps/app_sdk/JobUtils';
import {
  ExponentialRetriesJobOptions,
  JobRemoveOptions,
  merge,
} from '@waha/apps/app_sdk/constants';
import { EngineHelper } from '@waha/apps/chatwoot/waha';
import { WAHASelf, WAHASessionAPI } from '@waha/apps/app_sdk/waha/WAHASelf';
import {
  IgnoreJidConfig,
  isNullJid,
  isPnUser,
  JidFilter,
} from '@waha/core/utils/jids';

function oneJob(chat: string, data, opts: JobsOptions): FlowJob {
  data = lodash.cloneDeep(data);
  data.options.chat = chat;
  opts = lodash.cloneDeep(opts);
  return {
    name: chat,
    queueName: QueueName.TASK_MESSAGES_PULL,
    data: data,
    opts: merge(ExponentialRetriesJobOptions, JobRemoveOptions, opts),
    children: [],
  };
}

export async function MessagesPullStart(
  ctx: CommandContext,
  options: MessagesPullOptions,
  jobOptions: JobsOptions & JobDataTimeout,
) {
  const queue = ctx.queues.messagesPull;
  const jobId = ChatWootScheduleService.SingleJobId(ctx.data.app);
  const job: Job | null = await queue.getJob(jobId);

  if (job) {
    const state = await job.getState();
    const done = state === 'completed' || state === 'failed';
    if (!done) {
      const msg = ctx.l.r('cli.cmd.messages.pull.already-running', {
        chat: job.data.options.chat,
      });
      await ctx.conversation.incoming(msg);
      return;
    }

    await MessagesPullRemove(queue, ctx.data.app, ctx.logger);
  }
  const opts: JobsOptions = {
    ...jobOptions,
    ignoreDependencyOnFailure: true,
    delay: 1_000,
  };
  const data = {
    ...ctx.data,
    timeout: {
      job: jobOptions.timeout.job,
    },
    options: options,
  };
  const producer: FlowProducer = ctx.flows.messagesPull;
  let chats: string[] = [options.chat];

  if (options.chat === ChatID.ALL) {
    if (IsCommandsChat(data.body)) {
      if (EngineHelper.SupportsAllChatForMessage()) {
        //   keep "all" chats - that's fine
      } else {
        // "all" chats for engine that doesn't support it
        chats = await resolveAllToChats(ctx.waha, ctx.data.session, options);
        if (chats.length == 0) {
          throw new Error(ctx.l.r('cli.cmd.messages.pull.no-chats-found'));
        }
      }
    } else {
      // It's per-chat command, get the chat ids and run the pulling process
      chats = GetAllChatIDs(data.body?.conversation?.meta?.sender);
      chats = EngineHelper.FilterChatIdsForMessages(chats);
    }
  }
  const children = chats.map((chat) => oneJob(chat, data, opts));

  let root: FlowJob;
  if (children.length == 1) {
    // Schedule one job, no "summary" job required
    root = children[0];
  } else {
    // Add "summary" parent job so we get the overall progress at the end
    root = oneJob(ChatID.SUMMARY, data, opts);
    root.children = [ChainJobsOneAtATime(children)];
  }
  root.opts.jobId = jobId;
  await producer.add(root);
  const activity = new TaskActivity(ctx.l, ctx.conversation);
  await activity.details(data);
}

export async function MessagesPullStatus(ctx: CommandContext) {
  const queue = ctx.queues.messagesPull;
  const jobId = ChatWootScheduleService.SingleJobId(ctx.data.app);
  const job: Job | null = await queue.getJob(jobId);

  if (!job) {
    const msg = ctx.l.r('cli.cmd.messages.status.not-found');
    await ctx.conversation.incoming(msg);
    return;
  }

  const state = await job.getState();
  const msg = MessagesPullStatusMessage(ctx.l, job, state);
  await ctx.conversation.incoming(msg);
}

export async function MessagesPullRemove(
  queue: Queue,
  app: string,
  logger: ILogger,
): Promise<boolean> {
  const jobId = ChatWootScheduleService.SingleJobId(app);
  const job: Job | null = await queue.getJob(jobId);
  if (!job) {
    logger.info('Pull Messages job has already been removed');
    return false;
  }

  await job.remove();
  return true;
}

/**
 * WORKING ONLY FOR WEBJS
 */
async function resolveAllToChats(
  waha: WAHASelf,
  sessionName: string,
  options: MessagesPullOptions,
): Promise<string[]> {
  const session = new WAHASessionAPI(sessionName, waha);
  let chats = await session.getChats({
    limit: undefined,
    offset: undefined,
  });
  // new chat last
  chats = lodash.sortBy(chats, (c) => c.timestamp || 0);

  const gte = Date.now() - options.period.start;
  const result = [];
  const jids = new JidFilter(options.ignore);
  for (const chat of chats) {
    const id = chat.id._serialized;
    if (!jids.include(id)) {
      continue;
    }
    if (isNullJid(id)) {
      continue;
    }
    const timestamp = (chat.timestamp || Infinity) * 1000;
    if (timestamp < gte) {
      // Too old chat
      continue;
    }
    result.push(id);
  }
  return result;
}
