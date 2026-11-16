import { ApiProperty } from "@nestjs/swagger";
import { ArrayUnique, IsArray, isInt, IsInt, IsOptional, Min } from "class-validator";

export class CreateOrderItemDto {

    @ApiProperty({
    description: 'ID of the product to order',
    example: 1,
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({
     description: 'Quantity of product to purchase', example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;


  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({each : true})
  @Min(1, {each : true})
  modifierIds? : string[]
}