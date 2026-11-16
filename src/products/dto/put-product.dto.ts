
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { ProductStatus } from '../enum/product-status.enum.js';

export class PutProductDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;


  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;


}