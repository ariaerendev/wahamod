import { ChatWootAPIConfig } from '@waha/apps/chatwoot/client/interfaces';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDynamicObject } from '@waha/nestjs/validation/IsDynamicObject';
import { ConversationSort } from '@waha/apps/chatwoot/services/ConversationSelector';
import { ConversationStatus } from '@waha/apps/chatwoot/client/types';

export const DEFAULT_LOCALE = 'en-US';

export class ChatWootCommandsConfig {
  @IsBoolean()
  server: boolean = true;

  @IsOptional()
  @IsBoolean()
  queue?: boolean = false;
}

export enum LinkPreview {
  OFF = 'OFF',
  LQ = 'LG',
  HQ = 'HG',
}

export class ChatWootConversationsConfig {
  @IsEnum(ConversationSort)
  sort: ConversationSort;

  @IsOptional()
  @IsEnum(ConversationStatus, { each: true })
  status: Array<ConversationStatus> | null;

  @ApiPropertyOptional({
    description:
      'Process message.ack events to mark ChatWoot conversations as read. Enabled by default.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  markAsRead?: boolean = true;
}

export interface ChatWootConfig {
  templates: Record<string, string>;
  linkPreview: LinkPreview;
  commands: ChatWootCommandsConfig;
  conversations: ChatWootConversationsConfig;
}

export class ChatWootAppConfig implements ChatWootAPIConfig {
  @IsString()
  url: string;

  @IsNumber()
  accountId: number;

  @IsString()
  accountToken: string;

  @IsNumber()
  inboxId: number;

  @IsString()
  inboxIdentifier: string;

  @IsEnum(LinkPreview)
  @IsOptional()
  linkPreview?: LinkPreview = LinkPreview.OFF;

  @IsString()
  locale: string = DEFAULT_LOCALE;

  @IsOptional()
  @IsDynamicObject()
  templates?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatWootCommandsConfig)
  commands?: ChatWootCommandsConfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatWootConversationsConfig)
  conversations?: ChatWootConversationsConfig;
}
