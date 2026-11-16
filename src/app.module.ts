import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { databaseConfig } from './database/database.config.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ModifierModule } from './modifier/modifier.module.js';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal : true
    }),
    UsersModule,
    AuthModule,

    TypeOrmModule.forRoot({
      ...databaseConfig,
      autoLoadEntities : true,
      synchronize : false,
      logging : true
    }),

    ProductsModule,
    OrdersModule,
    ModifierModule
  ],
  controllers: [AppController],
  providers: [AppService,
      // global response interceptor
  // makes successful API responses follow one common structure
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

      // Global Exception Filter
      // handles exceptions in one cental place so error responses also follow a consistent structure 
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { 
    consumer 
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*')

      // .apply(RequestIdMiddleware)
      // .forRoutes({
      //   path : 'orders',
      //   method : RequestMethod.ALL
      // })
  }
}



