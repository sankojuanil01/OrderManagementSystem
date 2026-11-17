import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { DataSource, In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderItem } from './entities/order-item.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { Order } from './entities/order.entity.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { UserRole } from '../users/enum/roles.enum.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { ProductStatus } from '../products/enum/product-status.enum.js';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderMapper } from './mappers/order.mapper.js';
import type { AuthenticatedUser } from '../auth/interface/authenticated-user.interface.js';
import { RejectedOrderItem } from './interface/rejectedOrderItem.interface.js';
import { ModifierGroup } from '../modifier/entities/modifier.group.entity.js';
import { Modifier } from '../modifier/entities/modifier.entity.js';
import { OrderItemModifier } from './entities/order-item-modifier.entity.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  private readonly allowedTransitions: Record<
    OrderStatus,
    OrderStatus[]
  > = {
    [OrderStatus.PENDING]: [
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
    ],

    [OrderStatus.CONFIRMED]: [
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ],

    [OrderStatus.CANCELLED]: [],

    [OrderStatus.COMPLETED]: [],
  };

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository (Order)
    private readonly orderRepository : Repository<Order>
  ) {}

// create an order  
async createOrder(
  user: AuthenticatedUser,
  createOrderDto: CreateOrderDto,
) {

  // logger
  this.logger.log(
    `[SERVICE] OrdersService.createOrder - Initiating order creation for User ID: ${user.id}`,
  );

  //  logger
  this.logger.log(`[TRANSACTION] Creating QueryRunner`);

  const queryRunner = this.dataSource.createQueryRunner();
 
  try {
    //  Connect QueryRunner to database
    this.logger.log(`[QUERY-RUNNER] Connecting to database`);

    await queryRunner.connect();

    //  Start transaction
    this.logger.log(`[TRANSACTION] START`);
    await queryRunner.startTransaction();

    // Use this manager for ALL database operations
    const manager = queryRunner.manager;

    this.logger.log(
      `[VALIDATION] Using - authenticated user ID : ${user.id}`,
    );
    
    this.logger.log(
      `[VALIDATION] Checking order items`,
    );

    //  Merge duplicate product IDs
    // A Map stores data as key-value pairs 
    const mergedItems = new Map<
    string ,
    {
      productId : number;
      quantity : number;
      modifierIds : string[]
    }
    >();


    for (const item of createOrderDto.items) {

      const modifierIds = [...(item.modifierIds ?? [])].sort();

      const key = `${item.productId} : ${modifierIds.join(',')}`;

      const existingItem = mergedItems.get(key)
    
      const quantity =
        (existingItem?.productId ?? 0) +
        item.quantity;

      if (!Number.isSafeInteger(quantity)) {
        throw new BadRequestException(
          'Invalid product quantity',
        );
      }

      mergedItems.set(key, {
        productId : item.productId,
        quantity,
        modifierIds
      });
    }


    // Fetch all products and lock their rows
    const productIds = [
      ... new Set(
    [...mergedItems.values()].map(
      (item) => item.productId,
    ),
  ),
];

      const products = await manager.find(Product,{
        where: { id: In(productIds) },

        lock: {
          mode: 'pessimistic_write',
        },

      });

      this.logger.log(
      `[TRANSACTION] Successfully fetched ${products.length} products`,
    );

      const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    // fetch modifier groups 

    const modifierGroups = await manager.find(ModifierGroup, {
      where : {
        product : {
          id : In(productIds)
        },
      },
      relations : {
        product : true
      }
    })

    // fetch selected modifiers

    const allModifierIds = [
      ...new Set(
        [...mergedItems.values()].flatMap(
          (item) => item.modifierIds
        ),
      ),
    ];

    const modifierMap = new Map<string , Modifier>();

    if(allModifierIds.length > 0) {
      const modifiers = await manager.find(Modifier , {
        where : {
          id : In(allModifierIds)
        },
        relations : {
          group : {
            product : true
          }
        }
      })
      for (const modifier of modifiers) {
        modifierMap.set(modifier.id,modifier)
      }
    }

    

    const rejectedItems: RejectedOrderItem[] = [];

    const orderItems: OrderItem[] = [];

    const updatedProducts: Product[] = [];

    const validItems : {
      product : Product,
      quantity : number,
      modifiers : Modifier[]
    }[] = []

    let total = 0;

        // Products & Stock Validation
    for (const item of mergedItems.values()) {

      const product = productMap.get(item.productId);

      if (!product) {
        rejectedItems.push({
          productId : item.productId,
          productName : null,
          reason : "Product not found"
        });
        continue;
      }

      if (product.status !== ProductStatus.ACTIVE) {
        rejectedItems.push({
          productId: item.productId,
          productName : product.name,
          reason : `Product ${product.name} is inactive`
        });
        continue;
      }

      if (product.stock < item.quantity) {
        rejectedItems.push({
          productId: item.productId,
          productName : product.name,
          reason: `Insufficient stock for "${product.name}". Available Stock : ${product.stock}, Requested quantity : ${item.quantity}`,
        })

        continue
      }

      const selectedModifiers: Modifier[] = [];

      let invalidModifier = false;

      // Check duplicate modifier IDs

      if (
        new Set(item.modifierIds).size !==
        item.modifierIds.length
      ) {

        rejectedItems.push({
          productId: item.productId,
          productName: product.name,
          reason: 'Duplicate modifiers are not allowed',
        });

        continue;
      }

      // Validate selected modifiers

      for (const modifierId of item.modifierIds) {

        const modifier = modifierMap.get(modifierId);

        if (!modifier) {

          rejectedItems.push({
            productId: item.productId,
            productName: product.name,
            reason: `Modifier ${modifierId} not found`,
          });

          invalidModifier = true;
          break;
        }

        // Check modifier belongs to requested product

        if (modifier.group.product.id !== product.id) {

          rejectedItems.push({
            productId: item.productId,
            productName: product.name,
            reason: `Modifier ${modifier.name} does not belong to ${product.name}`,
          });

          invalidModifier = true;
          break;
        }

        // Check modifier group active status

        if (!modifier.group.isActive) {

          rejectedItems.push({
            productId: item.productId,
            productName: product.name,
            reason: `Modifier group ${modifier.group.name} is inactive`,
          });

          invalidModifier = true;
          break;
        }

        // Check modifier active status

        if (!modifier.isActive) {

          rejectedItems.push({
            productId: item.productId,
            productName: product.name,
            reason: `Modifier ${modifier.name} is inactive`,
          });

          invalidModifier = true;
          break;
        }

        selectedModifiers.push(modifier);
      }

      if (invalidModifier) {
        continue;
      }

      // --------------------------------------------------
      // 7. Validate modifier group selection rules
      // --------------------------------------------------

      const productGroups = modifierGroups.filter(
        (group) => group.product.id === product.id,
      );

      let invalidGroup = false;

      for (const group of productGroups) {

        const selectedCount = selectedModifiers.filter(
          (modifier) => modifier.group.id === group.id,
        ).length;

        const minimumRequired = group.isRequired
          ? Math.max(group.minSelect, 1)
          : group.minSelect;

        if (selectedCount < minimumRequired) {

          rejectedItems.push({
            productId: item.productId,
            productName: product.name,
            reason: `Please select at least ${minimumRequired} modifier(s) from ${group.name}`,
          });

          invalidGroup = true;
          break;
        }

        // maxSelect = 0 means unlimited

        if (
          group.maxSelect > 0 &&
          selectedCount > group.maxSelect
        ) {

          rejectedItems.push({
            productId: item.productId,
            productName: product.name,
            reason: `Maximum ${group.maxSelect} modifier(s) allowed in ${group.name}`,
          });

          invalidGroup = true;
          break;
        }
      }

      if (invalidGroup) {
        continue;
      }

      // Product and modifiers passed validation

      validItems.push({
        product,
        quantity: item.quantity,
        modifiers: selectedModifiers,
      });
    }

    // --------------------------------------------------
    // 8. Validate combined stock for each product
    // --------------------------------------------------

    const productQuantityMap = new Map<number, number>();

    for (const item of validItems) {

      const quantity =
        (productQuantityMap.get(item.product.id) ?? 0) +
        item.quantity;

      productQuantityMap.set(item.product.id, quantity);
    }

    const insufficientProducts = new Set<number>();

    for (const [productId, quantity] of productQuantityMap) {

      const product = productMap.get(productId)!;

      if (product.stock < quantity) {

        insufficientProducts.add(productId);

        rejectedItems.push({
          productId,
          productName: product.name,
          reason: `Insufficient stock for "${product.name}". Available Stock: ${product.stock}, Requested quantity: ${quantity}`,
        });
      }
    }

    // --------------------------------------------------
    // 9. Calculate prices and create OrderItems
    // --------------------------------------------------

    for (const item of validItems) {

      if (insufficientProducts.has(item.product.id)) {
        continue;
      }

      const productPrice = Number(item.product.price);

      // Calculate selected modifier price

      const modifierTotal = item.modifiers.reduce(
        (sum, modifier) => {

          return sum + Number(modifier.priceAdjustment);

        },
        0,
      );

      // Product price + modifier prices

      const unitPrice = Number(
        (productPrice + modifierTotal).toFixed(2),
      );

      // Calculate item total

      const itemTotal = Number(
        (unitPrice * item.quantity).toFixed(2),
      );

      total += itemTotal;

      // --------------------------------------------------
      // 10. Create OrderItemModifier snapshots
      // --------------------------------------------------

      const orderItemModifiers = item.modifiers.map(
        (modifier) => {

          return manager.create(OrderItemModifier, {

            modifier,

            modifierName: modifier.name,

            modifierPrice: modifier.priceAdjustment,

          });

        },
      );

      // --------------------------------------------------
      // 11. Create OrderItem
      // --------------------------------------------------

      const orderItem = manager.create(OrderItem, {

        product: item.product,

        quantity: item.quantity,

        price: unitPrice,

        total: itemTotal,

        modifiers: orderItemModifiers,

      });

      orderItems.push(orderItem);
    }

    //  Update product stock

    for (const [productId, quantity] of productQuantityMap) {

      if (insufficientProducts.has(productId)) {
        continue;
      }

      const product = productMap.get(productId)!;

      product.stock = product.stock - quantity;

      updatedProducts.push(product);
    }

    if (updatedProducts.length > 0) {

      await manager.save(Product, updatedProducts);

    }

    if (validItems.length === 0) {
  throw new BadRequestException({
    message: 'Order cannot be created because all items were rejected',
    rejectedItems,
  });
}

    //  Create Order
    const order = manager.create(Order, {

      user,

      total: Number(total.toFixed(2)),

      status: OrderStatus.PENDING,

      items: orderItems,

    });

    //  Save Order + OrderItems
    this.logger.log(
      `[POSTGRESQL] Executing database persistence: INSERT INTO orders & INSERT INTO order_items`,
    );

    const savedOrder = await manager.save(Order, order);

    const completeOrder = await manager.findOneOrFail(Order, {
  where: {
    id: savedOrder.id,
  },
  relations: {
    user: true,
    items: {
      product: true,
      modifiers: true,
    },
  },
});

const result = OrderMapper.toResponse(completeOrder);

    //  Commit transaction
    await queryRunner.commitTransaction();

    this.logger.log(`[TRANSACTION] COMMIT`);

    return  {
      order : result , rejectedItems
    }

  } catch (error) {
    //  Rollback transaction
    this.logger.error(
      `[TRANSACTION] ROLLBACK - Reason: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    if (queryRunner.isTransactionActive)
      // here checks wheather transaction has started and still active 
    {
      await queryRunner.rollbackTransaction();
    }

    throw error;
  } finally {
    //  Release database connection
    this.logger.log(`[QUERY-RUNNER] Releasing QueryRunner`);

    await queryRunner.release();
  }
}

  async findAll(
    userId: number,
    role: UserRole,
    status? : OrderStatus
  ) {
    this.logger.log(`[SERVICE] OrdersService.findAll - Querying orders for User ID: ${userId} (${role})`);


    if (role === UserRole.Admin) {
      this.logger.log(`[TYPEORM] Repository: OrderRepository.find() - Admin full retrieval`);

      const orders = await this.orderRepository.find({
        where : status ? {status} : {},
        // here if status is provided, query orders matching that status
        // if status is not exist uses undefined and no status condition is applied 
        relations: {
          user: true,
          items: { product: true },
        }
      });

      return orders.map((order) => OrderMapper.toResponse(order));
    }

    this.logger.log(`[TYPEORM] Repository: OrderRepository.find() - User specific retrieval`);
    
    const order = await this.orderRepository.find({
      where: {
        user: { id: userId },
        // here returns the orders associated with the specific user ID 

        ...(status && {status})
        // it allows you to add the status property only when a status value is provided 
        //
      },
      relations: {
        user: true,
        items: { product: true },
      }
    });

    return order.map((order) => OrderMapper.toResponse(order));
    
  }

  async findOne(
    id: number,
    userId: number,
    role: UserRole,
  ) {
    this.logger.log(`[SERVICE] OrdersService.findOne - Fetching Order ID: ${id}`);
    this.logger.log(`[TYPEORM] Repository: OrderRepository.findOne({ id: ${id} })`);

    const order = await this.orderRepository
      .findOne({
        where: { id },
        relations: {
          user: true,
          items: { product: true },
        },
      });

    if (!order) {
      this.logger.warn(`[SERVICE] OrdersService.findOne - Order ID ${id} not found`);
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (role !== UserRole.Admin && order.user.id !== userId) {


      this.logger.warn(`[SERVICE] OrdersService.findOne - Access denied: User ${userId} attempted to view order of User ${order.user.id}`);
      throw new ForbiddenException('You are not allowed to view this order');
    }

   return  OrderMapper.toResponse(order);
  }

  async updateStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
   user : AuthenticatedUser
  ) {
    this.logger.log(`[SERVICE] OrdersService.updateStatus - Updating Order ID: ${id} to status: ${updateOrderStatusDto.status}`);
    this.logger.log(`[TRANSACTION] Initiating status update transaction`);

    try {
      const result = await this.dataSource.transaction(
        async (manager) => {
          // manager is the TypeORM entityManager provided for this transaction
          this.logger.log(`[TRANSACTION] BEGIN`);

          this.logger.log(`[TYPEORM] Entity: Order - Locking Order ID: ${id} | Lock mode: pessimistic_write`);

          // locking the order
          const lockOrder = await manager.findOne(Order, {
            where: { id },
            lock: { mode: 'pessimistic_write' },
          });

          if (!lockOrder) {
            this.logger.warn(`[SERVICE] OrdersService.updateStatus - Order ID ${id} not found`);
            throw new NotFoundException('Order not found');
          }

         // fetch the order with related user and products 
          const order = await manager.findOne(Order, {
            where: { id },
            relations: {
              user : true,
              items: { product: true },
            },
          });

          if (!order) {
            throw new NotFoundException('Order not found');
          }

          // Check order ownership
        const isAdmin = user.role === UserRole.Admin;
        const isOwner = order.user.id === user.id;

        if (!isAdmin && !isOwner) {
          this.logger.warn(
            `[SERVICE] User ID ${user.id} is not authorized to update Order ID ${id}`,
          );

          throw new ForbiddenException(
            'You are not allowed to update this order',
          );
        }
   

          const currentStatus = order.status;
          const newStatus = updateOrderStatusDto.status;

          this.logger.log(`[SERVICE] OrdersService.updateStatus - Validating status transition: ${currentStatus} → ${newStatus}`);


          const allowed = this.allowedTransitions[currentStatus];

          if (!allowed.includes(newStatus)) {
            this.logger.warn(`[SERVICE] OrdersService.updateStatus - Invalid transition from ${currentStatus} to ${newStatus}`);


            throw new BadRequestException(
              `Invalid status transition: ${currentStatus} → ${newStatus}`,
            );
          }

          if (newStatus === OrderStatus.CANCELLED) {

            this.logger.log(`[SERVICE] OrdersService.updateStatus - Order cancellation detected. Restoring product stock`);

      const updatedProducts: Product[] = [];

          // Restore stock
      for (const item of order.items) {
        const product = item.product;

              if (!product) {
                throw new NotFoundException(`Product ${item.product.id} not found`);
              }

              product.stock += item.quantity;


              this.logger.log(`[TYPEORM] Entity: Product - Restored ${item.quantity} units to "${product.name}". New stock: ${product.stock}`);

            updatedProducts.push(product);

            this.logger.log(
              `[TYPEORM] Entity: Product - Restored ${item.quantity} units to "${product.name}". New stock: ${product.stock}`,
            );
          }

          // Save products 
          if (updatedProducts.length > 0) {
            await manager.save(Product, updatedProducts);
          }
        }
          this.logger.log(`[DATABASE] Updating Order status to ${newStatus}`);
           await manager.save(Order, order);

          this.logger.log(`[TRANSACTION] COMMIT`);
          return OrderMapper.toResponse(order);
        },
      );

      this.logger.log(`[SERVICE] OrdersService.updateStatus - Order status updated successfully`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[TRANSACTION] ROLLBACK - Reason: ${errorMessage}`);
      throw error;
    }
  }


}
