import { conversation_message_create } from '@figuro/chatwoot-sdk/dist/models/conversation_message_create';
import { SendAttachment } from '@waha/apps/chatwoot/client/types';

export function AttachmentFromBuffer(
  buffer: Buffer,
  filename: string,
): conversation_message_create {
  const content = buffer.toString('base64');
  const attachments: SendAttachment[] = [
    {
      content: content,
      filename: filename,
      encoding: 'base64',
    },
  ];
  const message: conversation_message_create = {
    content: '',
    attachments: attachments as any,
  };
  return message;
}
