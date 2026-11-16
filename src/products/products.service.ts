import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { ProductStatus } from './enum/product-status.enum.js';
import { PatchproductDto } from './dto/patchProduct.dto.js';
import { PutProductDto } from './dto/put-product.dto.js';



@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);
    
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository : Repository<Product>
    ) {}

    async createProduct(createProductDto : CreateProductDto) {
        const {name} = createProductDto;

        this.logger.log(`[SERVICE] ProductsService.createProduct - Checking product existence: ${name}`);
        this.logger.log(`[TYPEORM] Repository: ProductRepository.findOne({ name: "${name}" })`);

        const existingProduct = await this.productsRepository.findOne({
            where : { name }
        });

        if(existingProduct) {
            this.logger.warn(`[SERVICE] ProductsService.createProduct - Conflict: Product already exists`);

            throw new ConflictException('product already exists');
        }

        this.logger.log(`[TYPEORM] Entity: Product - Instantiating Product entity in memory`);

        const product = this.productsRepository.create({
            name: createProductDto.name,
    description: createProductDto.description,
    price: createProductDto.price,
    stock: createProductDto.stock,
    status: createProductDto.status ?? ProductStatus.ACTIVE,
        });

        this.logger.log(`[TYPEORM] Repository: ProductRepository.save() - Inserting Product into DB`);

        const savedProduct = await this.productsRepository.save(product);

        this.logger.log(`[SERVICE] ProductsService.createProduct - Product created successfully with ID: ${savedProduct.id}`);
        return savedProduct;
    }

    async getAllProducts(queryProductDto: QueryProductDto) {
        const {
          page = 1,
          limit = 10,
          search,
          status,
          sortBy = 'created_at',
          sortOrder = 'DESC',
          orderStatus
        } = queryProductDto;

        const skip = (page - 1) * limit;

        this.logger.log(`[SERVICE] ProductsService.getAllProducts - Initializing QueryBuilder`);
        this.logger.log(`[TYPEORM] QueryBuilder - Entity: Product | alias: "product"`);

        const queryBuilder = this.productsRepository.createQueryBuilder('product');

        queryBuilder
    .leftJoinAndSelect('product.orderItems', 'orderItem')
    .leftJoinAndSelect('orderItem.order', 'order',)

        // search filter
        if (search) {
          this.logger.log(`[TYPEORM] QueryBuilder - Adding filter: product.name) LIKE LOWER("%${search}%")`);
          
          queryBuilder.andWhere(
            'LOWER(product.name) ILIKE LOWER(:search)',
            { search: `%${search}%` },
          );
        }

        // Product status filter 
        if (status) {
    queryBuilder.andWhere(
        'product.status = :status',
        { status },
    );
}

    // orderStatus filteration 
    if(orderStatus) {
    queryBuilder.andWhere(
        'order.status = :orderStatus',{
            orderStatus
        }
    )
}

    const sortColumns: Record<string, string> = {
    name: 'product.name',
    price: 'product.price',
    stock: 'product.stock',
    created_at: 'product.created_at',
    order_total: 'order.total',
    order_status: 'order.status',
  };

        const safeSortColumn =
    sortColumns[sortBy] ?? 'product.created_at';

        this.logger.log(`[TYPEORM] QueryBuilder - Ordering by: product.${safeSortColumn} ${sortOrder} | Skip: ${skip}, Take: ${limit}`);

        queryBuilder
          .orderBy(safeSortColumn, sortOrder)
          .addOrderBy('product.id','ASC')
          .skip(skip)
          .take(limit);

        this.logger.log(`[TYPEORM] QueryBuilder - Executing getManyAndCount()`);

        const [products, total] = await queryBuilder.getManyAndCount();

        this.logger.log(`[SERVICE] ProductsService.getAllProducts - Found ${products.length} item(s) on current page out of ${total} total`);

        return {
          items: products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
    }

    async getProduct(id : number){
        this.logger.log(`[SERVICE] ProductsService.getProduct - Finding product ID: ${id}`);
        this.logger.log(`[TYPEORM] Repository: ProductRepository.findOne({ id: ${id} })`);

        const product = await this.productsRepository.findOne({
            where : {id}
        });

        if(!product) {
            this.logger.warn(`[SERVICE] ProductsService.getProduct - Product not found for ID: ${id}`);
            throw new NotFoundException('product not found');
        }
        return product;
    }

    async patchProduct(id: number, patchProductDto: PatchproductDto){
        this.logger.log(`[SERVICE] ProductsService.updateProduct - Updating product ID: ${id}`);

        const product = await this.getProduct(id);

        Object.assign(product, patchProductDto);

        this.logger.log(`[TYPEORM] Repository: ProductRepository.save() - Updating Product ID: ${id}`);

        const updatedProduct = await this.productsRepository.save(product);

        this.logger.log(`[SERVICE] ProductsService.updateProduct - Product updated successfully`);

        return updatedProduct;
    }

    async removeProduct(id : number){
        this.logger.log(`[SERVICE] ProductsService.removeProduct - Deleting product ID: ${id}`);

        const product = await this.getProduct(id);

        this.logger.log(`[TYPEORM] Repository: ProductRepository.remove() - Deleting Product ID: ${id}`);
        
        await this.productsRepository.remove(product);

        this.logger.log(`[SERVICE] ProductsService.removeProduct - Product deleted successfully`);
    }


    async updateProduct(
  id: number,
  putProductDto : PutProductDto ,
) {
 
  const product = await this.getProduct(id)


  Object.assign(product, putProductDto);


  const updatedProduct =
    await this.productsRepository.save(product);

  return updatedProduct;
}

    
}

