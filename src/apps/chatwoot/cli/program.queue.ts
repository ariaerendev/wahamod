import { Argument, Command } from 'commander';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { CommandDisabled } from '@waha/apps/chatwoot/cli/cmd.disabled';
import {
  QueueStart,
  QueueStatus,
  QueueStop,
} from '@waha/apps/chatwoot/cli/cmd.queue';

export function AddQueueCommand(
  program: Command,
  ctx: CommandContext,
  enabled: boolean,
) {
  const l = ctx.l;
  const QueueGroup = l.r('cli.cmd.root.sub.queue');
  program.commandsGroup(QueueGroup);

  program
    .command('queue', { hidden: !enabled })
    .alias('q')
    .summary(l.r('cli.cmd.queue.summary'))
    .description(l.r('cli.cmd.queue.description'))
    .helpGroup(QueueGroup)
    .addArgument(
      new Argument('[action]', l.r('cli.cmd.queue.action.description'))
        .choices(['status', 'start', 'stop', 'help'])
        .default('help'),
    )
    .addArgument(
      new Argument('[name]', l.r('cli.cmd.queue.argument.name')).default(''),
    )
    .action(async function (this: Command, action: string, name: string) {
      if (!action) {
        this.outputHelp();
        return;
      }

      if (action === 'help') {
        this.outputHelp();
        return;
      }

      if (!enabled) {
        await CommandDisabled(ctx, 'queue');
        return;
      }

      if (action === 'status') {
        await QueueStatus(ctx, name);
        return;
      }

      if (action === 'start') {
        await QueueStart(ctx, name);
        return;
      }

      if (action === 'stop') {
        await QueueStop(ctx, name);
        return;
      }

      this.outputHelp();
    });
}
