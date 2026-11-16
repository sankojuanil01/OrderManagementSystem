import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
// here class validator vadidates incomming data
import { UserRole } from "../../users/enum/roles.enum.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
// here it transforms/cleans incomming data 

export class CreateUserDto {

    @ApiProperty({ description: 'User full name',
    example: 'Ajay',
    
  })
    @Transform(({value}) => value?.trim())
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name : string

    @ApiProperty({
    description: 'Unique email address',
    example: 'ajay@gmail.com',
  })

    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail()
    email : string

    @ApiProperty({
    description: 'Password with minimum 6 characters',    
    example: '123456',
    
  })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password : string;

    @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.User,
  })
  @IsOptional()
    @IsEnum(UserRole)
    role? : UserRole


// swagger imports they are primarily for API documentation     

// @ApiProperty  : what are the fields should be entered in field it has description and with example 

// @ApiPropertyOptional : the property is optional 




    
}