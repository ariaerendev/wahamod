/**
 * Events
 */
import { ApiProperty } from '@nestjs/swagger';
import { ChatIdProperty } from '@waha/structures/properties.dto';
import { IsNotEmpty, IsString } from 'class-validator';

function CallIdProperty() {
  return ApiProperty({
    description: 'Call ID',
    example: 'ABCDEFGABCDEFGABCDEFGABCDEFG',
  });
}

export class RejectCallRequest {
  @ChatIdProperty()
  @IsString()
  @IsNotEmpty()
  from: string;

  @CallIdProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CallData {
  @CallIdProperty()
  id: string;

  @ChatIdProperty()
  from?: string;

  timestamp: number;

  isVideo: boolean;

  isGroup: boolean;

  _data: any;
}
