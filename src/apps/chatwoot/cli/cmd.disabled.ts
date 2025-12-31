import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';

export async function CommandDisabled(ctx: CommandContext, command: string) {
  const text = ctx.l.r('cli.cmd.disabled', { command: command });
  await ctx.conversation.incoming(text);
}
