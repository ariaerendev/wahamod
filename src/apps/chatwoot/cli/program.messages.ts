import { Argument, Command, Option } from 'commander';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import {
  JobAttemptsOption,
  JobTimeoutOption,
  ParseMS,
  NotNegativeNumber,
  ProgressOption,
} from '@waha/apps/chatwoot/cli/utils/options';
import {
  MessagesPullStart,
  MessagesPullStatus,
} from '@waha/apps/chatwoot/cli/cmd.messages';
import { MessagesPullOptions } from '@waha/apps/chatwoot/consumers/task/messages.pull';
import { JobsOptions } from 'bullmq';
import { JobDataTimeout } from '@waha/apps/app_sdk/AppConsumer';

export function AddMessagesCommand(
  program: Command,
  ctx: CommandContext,
  queue: boolean,
) {
  const l = ctx.l;
  const SyncGroup = l.r('cli.cmd.root.sub.sync');
  program.commandsGroup(SyncGroup);

  program
    .command('messages')
    .summary(l.r('cli.cmd.messages.summary'))
    .description(l.r('cli.cmd.messages.description'))
    .helpGroup(SyncGroup)
    .addArgument(
      new Argument(
        '[action]',
        l.r('cli.cmd.messages.action.description'),
      ).choices(['pull', 'status', 'help']),
    )
    .addArgument(
      new Argument('[end]', l.r('cli.cmd.messages.pull.argument.end'))
        .argParser(ParseMS)
        .default(ParseMS('1d'), '1d'),
    )
    .addArgument(
      new Argument('[start]', l.r('cli.cmd.messages.pull.argument.start'))
        .argParser(ParseMS)
        .default(ParseMS('0d'), '0d'),
    )
    .option(
      '-c, --chat <chat>',
      l.r('cli.cmd.messages.pull.option.chat'),
      'all',
    )
    .option('-f, --force', l.r('cli.cmd.messages.pull.option.force'))
    .option('--nd, --no-dm', l.r('cli.cmd.messages.pull.option.no-dm'))
    .option('-g, --groups', l.r('cli.cmd.messages.pull.option.groups'))
    .option('--ch, --channels', l.r('cli.cmd.messages.pull.option.channels'))
    .option('-s, --status', l.r('cli.cmd.messages.pull.option.status'))
    .option('--bc, --broadcast', l.r('cli.cmd.messages.pull.option.broadcast'))
    .option('-m, --media', l.r('cli.cmd.messages.pull.option.media'))
    .option('--pause', l.r('cli.cmd.messages.pull.option.pause'))
    .option(
      '--rc, --resolve-conversations',
      l.r('cli.cmd.messages.pull.option.resolve-conversations'),
    )
    .option(
      '-b, --batch <number>',
      l.r('cli.cmd.messages.pull.option.batch'),
      NotNegativeNumber,
      100 as any,
    )
    .addOption(ProgressOption(l.r('cli.cmd.messages.pull.option.progress')))
    .addOption(new JobAttemptsOption(l, 6))
    .addOption(new JobTimeoutOption(l, '10m'))
    .addOption(
      new Option(
        '--tm, --timeout-media <duration>',
        l.r('cli.cmd.messages.pull.option.timeout-media'),
      )
        .argParser(ParseMS)
        .default(ParseMS('30s'), '30s'),
    )
    .action(async (action, end, start, opts, cmd: Command) => {
      if (!action) {
        cmd.outputHelp();
        return;
      }

      if (action === 'help') {
        cmd.outputHelp();
        return;
      }

      if (action === 'status') {
        await MessagesPullStatus(ctx);
        return;
      }
      if (end > start) {
        // Swap
        const tmp = end;
        end = start;
        start = tmp;
      }

      if (opts.pause && !queue) {
        await ctx.conversation.incoming(
          l.r('cli.cmd.messages.pull.error.pause-no-queue'),
        );
        return;
      }

      const options: MessagesPullOptions = {
        chat: opts.chat,
        progress: opts.progress,
        period: {
          end: end,
          start: start,
        },
        media: opts.media,
        force: opts.force,
        pause: opts.pause,
        timeout: {
          media: opts.timeoutMedia,
        },
        batch: opts.batch,
        ignore: {
          dm: !opts.dm,
          status: !opts.status,
          groups: !opts.groups,
          channels: !opts.channels,
          broadcast: !opts.broadcast,
        },
        resolveConversations: opts.resolveConversations,
      };
      const jobOptions: JobsOptions & JobDataTimeout = {
        attempts: opts.attempts,
        timeout: {
          job: opts.timeout,
        },
      };
      await MessagesPullStart(ctx, options, jobOptions);
    });
}
