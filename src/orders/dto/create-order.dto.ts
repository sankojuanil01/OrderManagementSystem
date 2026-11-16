import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto.js';

export class CreateOrderDto {
    @ApiProperty({
    type: [CreateOrderItemDto],
    example: [
      {
        productId: 1,
        quantity: 2,
      },
      {
        productId: 2,
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  // validates each object inside the array against the validation rules defined in its DTO
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}