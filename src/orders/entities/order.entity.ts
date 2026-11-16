import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { User } from '../../users/entities/user.entity.js';
import { OrderStatus } from '../enums/order-status.enum.js';
import { OrderItem } from './order-item.entity.js';
import { RejectedOrderItem } from '../interface/rejectedOrderItem.interface.js';

@Entity('orders')

// Helps retrieve a user's orders sorted by creation date
@Index('idx_orders_user_created_at', ['user', 'created_at'])

// Helps filter orders by status
@Index('idx_orders_status', ['status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // many orders belong to one user 
  // nullable : false means every order must have a user 
  @ManyToOne('User', (user: User) => user.orders, {
    nullable: false,
    
  })
  // inverse side call-back
  // user:User represents the related User entity
  // user.orders refers to orders property in the User entity

  // maps the relation to the user_id in the orders table 
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;

  // stores the current status of the order
  // only values defined in OrderStatus are allowed
  // new orders automatically start as pending 
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // one order can contain multiple order items 
  @OneToMany( () => OrderItem, (orderItem) => orderItem.order,{cascade: true},
  )
  items: OrderItem[];

  @CreateDateColumn({
      name: 'created_at',
        type: 'timestamptz',
    })
    created_at : Date;

    @UpdateDateColumn({
      name: 'updated_at',
        type: 'timestamptz',
    })
    updated_at : Date;

}