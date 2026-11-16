import { Body, Controller, Post, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from './decorators/response-message.decorator.js';


@ApiTags('Authentication')
// here put all endpoints from this controller under the authentication 
@Controller('auth') 

export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('User loggined Successfully')
  @ApiOperation({
    summary: 'User login',
    description:
      'Login using email and password and receive a JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful ,returns JWT access token',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
  ) {
    this.logger.log(
      `[CONTROLLER] AuthController.login - Processing login for email: ${loginUserDto.email}`,
    );
    
    try{
      return await this.authService.login(loginUserDto);
    }catch(error){
      throw new BadRequestException('user not found ')
    }
  }

  @Post('refresh')
  async refresh(
    @Body('refresh_token') refreshToken : string,
  ) {
    this.logger.log(
      `[CONTROLLER] AuthController.refresh - Processing refresh token request`,
    );
    return await this.authService.refreshAccessToken(refreshToken);
  }
}


    

