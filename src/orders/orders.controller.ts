import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UserRole } from '../users/enum/roles.enum.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../auth/decorators/response-message.decorator.js';
import { currentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interface/authenticated-user.interface.js';
import { OrderQueryDto } from './dto/order-query.dto.js';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @ResponseMessage("Order created Successfully")
  @ApiOperation({
    summary: 'Create a new order (Authenticated User)',
    description:
      'Create an order, validate stock, calculate totals and reduce product stock inside a transaction.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order or insufficient stock',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'User or product not found',
  })
  async create(
    @currentUser() user : AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {

    this.logger.log(
      `[CONTROLLER] OrdersController.create - User ID: ${user.id} | DTO: CreateOrderDto (${createOrderDto.items.length} items)`,
    );

    try{
      return await this.ordersService.createOrder(
      user,
      createOrderDto,
    );
    } catch(error){
      throw error
    }
  }

  @Get()
  @ResponseMessage("Orders fetched successfully")
  @ApiOperation({
    summary: 'Get orders',
    description:
      'ADMIN can view all orders. USER can view their own orders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@currentUser() user: AuthenticatedUser,
@Query() queryDto: OrderQueryDto,) {

    this.logger.log(
      `[CONTROLLER] OrdersController.findAll - User ID: ${user.id} | Role: ${user.role}`,
    );

    return await this.ordersService.findAll(
      user.id,
      user.role,
      queryDto.status
    );
  }

  @Get(':id')
  @ResponseMessage("Orders fetched by ID")
  @ApiOperation({
    summary: 'Get order details by ID',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to view this order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @currentUser() user: AuthenticatedUser,
  ) {


    this.logger.log(
      `[CONTROLLER] OrdersController.findOne - Order ID: ${id} | User ID: ${user.id} (${user.role})`,
    );

    return await this.ordersService.findOne(
      id,
      user.id,
      user.role,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ResponseMessage("Updated order status successfully")
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Only ADMIN can update order status. Valid transitions are PENDING → CONFIRMED/CANCELLED and CONFIRMED → COMPLETED/CANCELLED.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  @ApiResponse({
    status: 403,
    description: 'Only ADMIN can change order status',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
 async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateOrderStatusDto: UpdateOrderStatusDto,
    @currentUser() user : AuthenticatedUser
  ) {
    this.logger.log(
      `[CONTROLLER] OrdersController.updateStatus - Order ID: ${id} | Target Status: ${updateOrderStatusDto.status}`,
    );

    return await this.ordersService.updateStatus(
      id,
      updateOrderStatusDto,
      user
    );
  }
}
