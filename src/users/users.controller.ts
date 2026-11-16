import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from '../auth/dto/create-user.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from './enum/roles.enum.js';
import { ResponseMessage } from '../auth/decorators/response-message.decorator.js';
import { currentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interface/authenticated-user.interface.js';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ResponseMessage("User registrated successfully")
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ) {
    this.logger.log(
      `[CONTROLLER] UsersController.createUser - DTO: CreateUserDto | Email: ${createUserDto.email}`,
    );
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ResponseMessage('Users fetched successfully')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users - Admin only',
  })
  @ApiResponse({
    status: 200,
    description: 'All users retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT access token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  async getAllUsers() {
    this.logger.log(
      `[CONTROLLER] UsersController.getAllUsers - Retrieving all users (Admin)`,
    );
    return await this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Retrieved profile successfully')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get logged-in user profile',
    description:
      'Returns the profile of the currently authenticated user based on the JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged-in user profile retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT access token is missing or invalid.',
  })
  async getMyProfile(
    @currentUser() user : AuthenticatedUser
  ) {
    this.logger.log(
      `[CONTROLLER] UsersController.getMyProfile - User ID: ${user.id}`,
    );
    return await this.usersService.findById(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description:
      'Returns a specific user by ID. Admin access required.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT access token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.logger.log(
      `[CONTROLLER] UsersController.getProfile - Target User ID: ${id}`,
    );
    return await this.usersService.findById(id);
  }
}
