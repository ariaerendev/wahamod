import { ApiProperty } from '@nestjs/swagger';
import { LimitOffsetParams } from '@waha/structures/pagination.dto';

export class LidToPhoneNumber {
  @ApiProperty({
    description: 'Linked ID for the user',
    example: '1111111@lid',
  })
  lid?: string;

  @ApiProperty({
    description: 'Phone number (chat id) for the user',
    example: '3333333@c.us',
  })
  pn?: string;
}

export class LidsListQueryParams extends LimitOffsetParams {
  limit?: number = 100;
  offset?: number = 0;
}
