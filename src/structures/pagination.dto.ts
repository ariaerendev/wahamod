import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateIf } from 'class-validator';

export enum SortOrder {
  DESC = 'desc',
  ASC = 'asc',
}
export class LimitOffsetParams {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class PaginationParams extends LimitOffsetParams {
  @ApiProperty({
    description: 'Sort by field',
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description:
      'Sort order - <b>desc</b>ending (Z => A, New first) or <b>asc</b>ending (A => Z, Old first)',
  })
  @IsOptional()
  sortOrder?: SortOrder;
}
