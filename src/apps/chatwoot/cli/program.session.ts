import { Command } from 'commander';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import {
  SessionLogout,
  SessionQR,
  SessionRestart,
  SessionScreenshot,
  SessionStart,
  SessionStatus,
  SessionStop,
} from '@waha/apps/chatwoot/cli/cms.session';

export function AddSessionCommand(program: Command, ctx: CommandContext) {
  const l = ctx.l;
  const SessionGroup = l.r('cli.cmd.root.sub.session');
  program.commandsGroup(SessionGroup);

  program
    .command('status')
    .alias('1')
    .description(l.r('cli.cmd.session.status.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionStatus(ctx));
  program
    .command('restart')
    .alias('2')
    .description(l.r('cli.cmd.session.restart.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionRestart(ctx));
  program
    .command('start')
    .alias('3')
    .description(l.r('cli.cmd.session.start.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionStart(ctx));
  program
    .command('stop')
    .alias('4')
    .description(l.r('cli.cmd.session.stop.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionStop(ctx));
  program
    .command('logout')
    .alias('5')
    .description(l.r('cli.cmd.session.logout.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionLogout(ctx));
  program
    .command('qr')
    .alias('6')
    .description(l.r('cli.cmd.session.qr.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionQR(ctx));
  program
    .command('screenshot')
    .alias('7')
    .description(l.r('cli.cmd.session.screenshot.description'))
    .helpGroup(SessionGroup)
    .action(() => SessionScreenshot(ctx));
}
