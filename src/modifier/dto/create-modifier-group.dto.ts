import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min,  } from "class-validator";


export class CreateModifierGroupDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name : string;

    @IsInt()
  @Min(0)
  productId: number;

    @IsOptional()
    @IsBoolean()
    isRequired? : boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    minSelect? : number;

    @IsOptional()
    @IsInt()
    @Min(0)
    maxSelect? : number;

    @IsOptional()
    @IsBoolean()
    isActive? : boolean;


}