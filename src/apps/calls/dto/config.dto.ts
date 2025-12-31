import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CallsAppChannelConfig {
  @ApiProperty({
    description: 'Reject incoming calls for this chat type',
    default: true,
  })
  @IsBoolean()
  reject: boolean = true;

  @ApiProperty({
    description:
      'Optional auto-reply message sent after the call is rejected. If empty, no message is sent.',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CallsAppConfig {
  @ApiProperty({
    description: 'Rules applied to direct messages (non-group calls)',
    type: CallsAppChannelConfig,
  })
  @ValidateNested()
  @Type(() => CallsAppChannelConfig)
  dm: CallsAppChannelConfig = new CallsAppChannelConfig();

  @ApiProperty({
    description: 'Rules applied to group calls',
    type: CallsAppChannelConfig,
  })
  @ValidateNested()
  @Type(() => CallsAppChannelConfig)
  group: CallsAppChannelConfig = new CallsAppChannelConfig();
}
