import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Order } from './order.entity.js';
import type { Product } from '../../products/entities/product.entity.js';

@Entity('order_items')

// fast retrival of items belonging to an order 
@Index('idx_order_items_order_id', ['order'])

// fast retrival of order items associated with a product 
@Index('idx_order_items_product_id', ['product'])


export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  // many orderItems belong to one Order
  @ManyToOne('Order', (order: Order) => order.items, {
    nullable: false,
    // every OrderItem must belong to an order
    onDelete: 'CASCADE',
    // if order is deleted its orderItems are automtically deletd by database 
  })
  @JoinColumn({ name: 'order_id'  })
  order!: Order;

  // Many OrderItems can refer to the same product 
  @ManyToOne('Product', (product: Product) => product.orderItems, {
    nullable: false,
    // every OrderItem must reference an existing product 
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column('int')
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;
}