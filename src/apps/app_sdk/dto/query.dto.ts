import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ListAppsQuery {
  @ApiProperty({
    example: 'default',
    required: true,
    description: 'Session name to list apps for',
  })
  @IsString()
  @IsNotEmpty()
  session: string;
}
