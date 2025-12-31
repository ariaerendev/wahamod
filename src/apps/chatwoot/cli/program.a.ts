import { ChatWootCommandsConfig } from '@waha/apps/chatwoot/dto/config.dto';
import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { Argument, Command, Option, OutputConfiguration } from 'commander';
import {
  buildFormatHelp,
  fullCommandPath,
} from '@waha/apps/chatwoot/cli/utils/help';
import { AddSessionCommand } from '@waha/apps/chatwoot/cli/program.session';
import { AddContactsCommand } from '@waha/apps/chatwoot/cli/program.contacts';
import { AddMessagesCommand } from '@waha/apps/chatwoot/cli/program.messages';
import { AddServerCommand } from '@waha/apps/chatwoot/cli/program.server';
import { AddQueueCommand } from '@waha/apps/chatwoot/cli/program.queue';

function Program(ctx: CommandContext, output: OutputConfiguration) {
  const l = ctx.l;
  const program = new Command();
  program
    .name('')
    .description(l.r('cli.cmd.root.description'))
    .exitOverride()
    .configureOutput(output)
    .showSuggestionAfterError(true)
    .configureHelp({
      helpWidth: 200,
      styleOptionTerm(str: string) {
        return `- \`${str}\``;
      },
      styleArgumentTerm(str: string) {
        return `- **${str}**`;
      },
      styleUsage(str) {
        return `**${str}**`;
      },
      styleSubcommandTerm(str: string) {
        return `- **${str}**`;
      },
      styleSubcommandDescription(str: string) {
        return str ? `- ${str}` : str;
      },
      subcommandTerm: fullCommandPath,
      commandUsage(cmd) {
        // For the root program - no usage
        if (!cmd.parent)
          return `${l.r('cli.usage.command')} ${l.r('cli.usage.options')}`;
        // For subcommands, keep default behavior
        if (cmd.commands.length > 0) {
          return `${fullCommandPath(cmd)} ${l.r('cli.usage.command')} ${l.r(
            'cli.usage.options',
          )}`;
        }
        return `${fullCommandPath(cmd)} ${l.r('cli.usage.options')}`;
      },
      formatHelp: buildFormatHelp(l),
    });
  return program;
}

export function BuildProgram(
  commands: ChatWootCommandsConfig,
  ctx: CommandContext,
  output: OutputConfiguration,
) {
  const program = Program(ctx, output);
  AddSessionCommand(program, ctx);
  AddContactsCommand(program, ctx);
  AddMessagesCommand(program, ctx, commands.queue);
  AddQueueCommand(program, ctx, commands.queue);
  AddServerCommand(program, ctx, commands.server);
  return program;
}
