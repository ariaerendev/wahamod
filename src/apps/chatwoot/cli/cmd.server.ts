import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';

export async function ServerStatus(ctx: CommandContext) {
  ctx.logger.info('Getting server version and status');
  const version = await ctx.waha.serverVersion();
  const status = await ctx.waha.serverStatus();
  const text = ctx.l.key(TKey.APP_SERVER_VERSION_AND_STATUS).render({
    version: JSON.stringify(version, null, 2),
    status: JSON.stringify(status, null, 2),
  });
  await ctx.conversation.incoming(text);
}

export async function ServerReboot(ctx: CommandContext, force: boolean) {
  const type = force ? 'force' : 'graceful';
  const tkey = force ? TKey.APP_SERVER_REBOOT_FORCE : TKey.APP_SERVER_REBOOT;
  ctx.logger.info(`Rebooting server (${type})`);
  const text = ctx.l.key(tkey).render();
  await ctx.conversation.incoming(text);
  await ctx.waha.serverReboot(false);
}
