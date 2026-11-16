import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enum/roles.enum.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../auth/decorators/response-message.decorator.js';
import { PatchproductDto } from './dto/patchProduct.dto.js';
import { PutProductDto } from './dto/put-product.dto.js';



@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(
        private readonly productsService : ProductsService
    ){}

    @Post()
    @Roles(UserRole.Admin)
    @ResponseMessage("Product Created Succesfully")
    @ApiOperation({
        summary: 'Create a product',
        description: 'Only ADMIN users can create products.',
    })
    @ApiResponse({
        status: 201,
        description: 'Product created successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid product data',
    })
    @ApiResponse({
        status: 401,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: 403,
        description: 'Only ADMIN users can perform this operation',
    })
    @ApiResponse({
        status: 409,
        description: 'Product already exists',
    })
    async createProduct(@Body() createProductDto : CreateProductDto){
        this.logger.log(
            `[CONTROLLER] ProductsController.createProduct - DTO: CreateProductDto | Name: ${createProductDto.name}`,
        );
        return await this.productsService.createProduct(createProductDto);
    }

    @Get()
    @ResponseMessage("Products fetched successfully")
    @ApiOperation({
        summary: 'Get products',
        description: 'Get products using pagination, search and sorting.',
    })
    @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of products per page' })
    @ApiQuery({ name: 'search', required: false, example: 'Biryani', description: 'Search products by name' })
    @ApiQuery({ name: 'sortBy', required: false, example: 'price', description: 'Field used for sorting' })
    @ApiQuery({ name: 'sortOrder', required: false, example: 'DESC', description: 'Sorting direction' })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
    async getAllProducts(@Query() queryProductDto: QueryProductDto){
        this.logger.log(
            `[CONTROLLER] ProductsController.getAllProducts - DTO: QueryProductDto | Page: ${queryProductDto.page || 1}, Limit: ${queryProductDto.limit || 10}, Search: ${queryProductDto.search || 'none'}`,
        );
        return await this.productsService.getAllProducts(queryProductDto);
    }

    @Get(':id')
    @ResponseMessage("Products fetched by ID")
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', example: 1, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product found' })
    @ApiResponse({ status: 404, description: 'Product not found' })

    async getProduct(@Param('id', ParseIntPipe) id : number) {
        this.logger.log(
            `[CONTROLLER] ProductsController.getProduct - Product ID: ${id}`,
        );
        return await this.productsService.getProduct(id);
    }

    @Patch(':id')
    @Roles(UserRole.Admin)
    @ResponseMessage('Product updated Successfully')
    @ApiOperation({ summary: 'Update a product', description: 'Only ADMIN users can update products.' })
    @ApiParam({ name: 'id', example: 1, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({ status: 403, description: 'Only ADMIN can update products' })
    @ApiResponse({ status: 404, description: 'Product not found' })

    async patchProduct(
        @Param('id', ParseIntPipe) id : number,
        @Body() patchProductDto : PatchproductDto
    ){
        this.logger.log(
            `[CONTROLLER] ProductsController.updateProduct - Product ID: ${id} | DTO: UpdateproductDto`,
        );
        return await this.productsService.patchProduct(id, patchProductDto);
    }

    @Delete(':id')
    @Roles(UserRole.Admin)
    @ResponseMessage("Product deleted successfully")
    @ApiOperation({ summary: 'Delete a product', description: 'Only ADMIN users can delete products.' })
    @ApiParam({ name: 'id', example: 1, description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 403, description: 'Only ADMIN can delete products' })
    @ApiResponse({ status: 404, description: 'Product not found' })

    async removeProduct(
        @Param('id', ParseIntPipe) id : number,
    ){
        this.logger.log(
            `[CONTROLLER] ProductsController.removeProduct - Product ID: ${id}`,
        );
        return await this.productsService.removeProduct(id);
    }


     @Put(':id/update')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() putProductDto: PutProductDto,
  ) {
    return this.productsService.updateProduct(
      id,
      putProductDto,
    );
  }



}
