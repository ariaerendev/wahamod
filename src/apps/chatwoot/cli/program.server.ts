import { Command } from 'commander';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { CommandDisabled } from '@waha/apps/chatwoot/cli/cmd.disabled';
import { ServerReboot, ServerStatus } from '@waha/apps/chatwoot/cli/cmd.server';

export function AddServerCommand(
  program: Command,
  ctx: CommandContext,
  enabled: boolean,
) {
  const l = ctx.l;
  const ServerGroup = l.r('cli.cmd.root.sub.server');
  program.commandsGroup(ServerGroup);

  const server = program
    .command('server', { hidden: !enabled })
    .description(l.r('cli.cmd.server.description'))
    .helpGroup(ServerGroup);
  if (!enabled) {
    // Do not show help, show disabled ASAP
    server.action(() => CommandDisabled(ctx, 'server'));
  }
  server
    .command('status')
    .description(l.r('cli.cmd.server.status.description'))
    .action(() =>
      enabled ? ServerStatus(ctx) : CommandDisabled(ctx, 'server status'),
    );
  server
    .command('reboot')
    .description(l.r('cli.cmd.server.reboot.description'))
    .option('-f, --force', l.r('cli.cmd.server.reboot.option.force'), false)
    .action((opts) =>
      enabled
        ? ServerReboot(ctx, opts.force)
        : CommandDisabled(ctx, 'server reboot'),
    );
}
