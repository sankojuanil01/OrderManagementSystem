import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";
import { ProductStatus } from "../enum/product-status.enum.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateProductDto {

    @ApiProperty({
        description: 'The name of the',
    example: 'Chicken Biryani',
    
  })

    @Transform(({value})=> typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name : string;

    @ApiPropertyOptional({
    example: 'Hyderabadi Chicken Biryani',
    description: 'Product description',
  })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description? : string | null;

    @ApiProperty({
    example: 250,
    description: 'Product price',
    minimum: 0.01,
  })
    @IsNumber({maxDecimalPlaces :2})
    @IsNotEmpty()
    @IsPositive()
    price : number;

    @ApiProperty({
    example: 20,
    description: 'Available stock',
    minimum: 0,
  })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    stock : number;

@IsOptional()
@IsEnum(ProductStatus)
status?: ProductStatus


}