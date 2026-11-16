import 'reflect-metadata';
import 'dotenv/config'
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { databaseConfig } from './database.config.js';

export const orderManagementDataSource =  new DataSource({

  ...databaseConfig,

  // entities: [User,Product,Order,OrderItem],

entities : ['dist/**/*.entity.js'],

  migrations: ['dist/migrations/*.js'],
  logging: true,

  synchronize: false,
  
  
});