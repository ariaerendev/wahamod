import { CommandContext } from '@waha/apps/chatwoot/cli/types';
import { TKey } from '@waha/apps/chatwoot/i18n/templates';
import { SessionStatusEmoji } from '@waha/apps/chatwoot/emoji';
import { AttachmentFromBuffer } from '@waha/apps/chatwoot/client/messages';
import { MessageType } from '@waha/apps/chatwoot/client/types';

export async function SessionRestart(ctx: CommandContext) {
  await ctx.waha.restart(ctx.data.session);
}

export async function SessionStart(ctx: CommandContext) {
  return SessionRestart(ctx);
}

export async function SessionLogout(ctx: CommandContext) {
  ctx.logger.info(`Logging out session ${ctx.data.session}`);
  await ctx.waha.logout(ctx.data.session);
  const text = ctx.l.key(TKey.APP_LOGOUT_SUCCESS).render();
  await ctx.conversation.incoming(text);
}

export async function SessionStop(ctx: CommandContext) {
  ctx.logger.info(`Stopping session ${ctx.data.session}`);
  await ctx.waha.stop(ctx.data.session);
}

export async function SessionStatus(ctx: CommandContext) {
  ctx.logger.info(`Getting status for session ${ctx.data.session}`);
  const session = await ctx.waha.get(ctx.data.session);
  const emoji = SessionStatusEmoji(session.status);
  const text = ctx.l.key(TKey.APP_SESSION_CURRENT_STATUS).render({
    emoji: emoji,
    session: session.name,
    status: session.status,
    name: session.me?.pushName || 'Unknown',
    id: session.me?.id || 'No phone number',
  });
  await ctx.conversation.incoming(text);
}

export async function SessionQR(ctx: CommandContext) {
  const content = await ctx.waha.qr(ctx.data.session);
  const message = AttachmentFromBuffer(content, 'qr.jpg');
  message.message_type = MessageType.INCOMING;
  await ctx.conversation.send(message);
}

export async function SessionScreenshot(ctx: CommandContext) {
  ctx.logger.info(`Getting screenshot for session ${ctx.data.session}`);
  const content = await ctx.waha.screenshot(ctx.data.session);
  const message = AttachmentFromBuffer(content, 'screenshot.jpg');
  message.message_type = MessageType.INCOMING;
  await ctx.conversation.send(message);
}
