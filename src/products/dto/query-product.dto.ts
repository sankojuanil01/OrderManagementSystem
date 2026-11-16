import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProductStatus } from '../enum/product-status.enum.js';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

export type ProductSortField =
    | 'name'
    | 'price'
    | 'stock'
    | 'created_at'
    | 'order_total'
    | 'order_status'

export class QueryProductDto {

    // pagination 
    @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of products per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  // search 
  @ApiPropertyOptional({
    example: 'Biryani',
    description: 'Search by product name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // sorting 
  @ApiPropertyOptional({
    example: 'price',
    enum: ['name', 'price', 'stock', 'created_at'],
    default: 'created_at',
  })
  @IsOptional()
  @IsIn(['name', 'price', 'stock', 'created_at','order_total','order_status'])
  sortBy: ProductSortField = 'created_at';

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @Transform(({value}) => typeof value === 'string' ? value.toUpperCase() : value)
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  // Filter by product status
@ApiPropertyOptional({
    example: ProductStatus.ACTIVE,
    enum: ProductStatus,
    description: 'Filter products by status',
})
@IsOptional()
@Transform(({value}) => typeof value === 'string' ? value.toUpperCase() : value)
@IsEnum(ProductStatus)
status?: ProductStatus;

@IsOptional()
@Transform(({value}) => typeof value === 'string' ? value.toUpperCase() : value)
@IsEnum(OrderStatus)
orderStatus? : OrderStatus;
}