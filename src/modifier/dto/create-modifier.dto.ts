import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, MaxLength, Min } from "class-validator";


export class CreateModifierDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name : string;

    @IsNumber({
        maxDecimalPlaces : 2
    })
    @Min(0)
    priceAdjustment : number;
    
    @IsUUID()
    groupId : string;
}