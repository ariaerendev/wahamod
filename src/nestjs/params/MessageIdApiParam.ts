import { ApiParam } from '@nestjs/swagger';

export const MessageIdApiParam = ApiParam({
  name: 'messageId',
  required: true,
  type: 'string',
  description:
    'Message ID in format <code>{fromMe}_{chat}_{message_id}[_{participant}]</code>',
  example: 'true_123456789@c.us_BAE6A33293978B16',
});
