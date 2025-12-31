import { ApiProperty } from '@nestjs/swagger';
import {
  AllEvents,
  AllEventType,
  WAHAEvents,
} from '@waha/structures/enums.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { each } from 'lodash';

export enum RetryPolicy {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  CONSTANT = 'constant',
}

export class RetriesConfiguration {
  @ApiProperty({
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  delaySeconds?: number;

  @ApiProperty({
    example: 15,
  })
  @IsNumber()
  @IsOptional()
  attempts?: number;

  @ApiProperty({
    example: RetryPolicy.LINEAR,
  })
  @IsOptional()
  @IsEnum(RetryPolicy)
  policy?: RetryPolicy;
}

export class CustomHeader {
  @ApiProperty({
    example: 'X-My-Custom-Header',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Value',
  })
  @IsString()
  value: string;
}

export class HmacConfiguration {
  @ApiProperty({
    example: 'your-secret-key',
  })
  @IsString()
  @IsOptional()
  key?: string;
}

export class WebhookConfig {
  @ApiProperty({
    example: 'https://webhook.site/11111111-1111-1111-1111-11111111',
    required: true,
    description:
      'You can use https://docs.webhook.site/ to test webhooks and see the payload',
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  url: string;

  @ApiProperty({
    example: ['message', 'session.status'],
    required: true,
  })
  @IsIn(AllEvents, { each: true })
  @IsArray()
  events: AllEventType[];

  @ApiProperty({
    example: null,
  })
  @ValidateNested()
  @Type(() => HmacConfiguration)
  @IsOptional()
  hmac?: HmacConfiguration;

  @ApiProperty({
    example: null,
  })
  @ValidateNested()
  @Type(() => RetriesConfiguration)
  @IsOptional()
  retries?: RetriesConfiguration;

  @ApiProperty({
    example: null,
  })
  @ValidateNested()
  @Type(() => CustomHeader)
  @IsArray()
  @IsOptional()
  customHeaders?: CustomHeader[];
}
