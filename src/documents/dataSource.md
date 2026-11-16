## dataSource :
> is the object provided by TypeORM that manages database connections and configurations 
> it acts as the bridge between nestjs application and database 

> here provides the functionality needed to interact with the database using TypeORM

## why using dataSource in project :
> we use Typeorm dataSource to manage database interactions b/w nestjs application and postgres 
> it provides access to repositories, supports transactions, and allows us to execute database opertaions reliably 



// 1. Main Order Management DataSource
export const orderManagementDataSource = new DataSource({
  ...databaseConfig,

  entities: [
    User,
    Product,
    Order,
    OrderItem,
  ],

  migrations: ['dist/migrations/*.js'],
  logging: true,
  synchronize: false,
});

// 2. Reporting and Audit DataSource
export const reportingDataSource = new DataSource({
  ...databaseConfig,

  database: process.env.REPORTING_DB_NAME,

  entities: [AuditLog],

  migrations: ['dist/reporting-migrations/*.js'],
  logging: true,
  synchronize: false,
});

## dataBaseConfig : 

// First database: Order Management
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'order_management_system_advanced',
      entities: [Order],
      synchronize: false,
    }),

    // Second database: Analytics
    TypeOrmModule.forRoot({
      name: 'analyticsConnection',
      type: 'postgres',
      host: process.env.ANALYTICS_DB_HOST,
      port: 5432,
      username: process.env.ANALYTICS_DB_USERNAME,
      password: process.env.ANALYTICS_DB_PASSWORD,
      database: 'analytics_db',
      entities: [Analytics],
      synchronize: false,
    }),


## in the service.ts 

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reportingService: ReportingService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    // Create order and update stock using
    // the main DataSource transaction.
    const order = await this.dataSource.transaction(
      async (manager) => {
        const newOrder = manager.create(Order, {
          // Map the actual DTO fields here.
        });

        return manager.save(Order, newOrder);
      },
    );

    // Runs after the main transaction commits.
    await this.reportingService.logOrderCreated(order.id);

    return order;
  }
}

@Injectable()
export class ReportingService {
  constructor(
    @InjectDataSource('reportingConnection')
    private readonly reportingDataSource: DataSource,
  ) {}

  async logOrderCreated(orderId: string) {
    await this.reportingDataSource
      .getRepository(AuditLog)
      .insert({
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: orderId,
      });
  }
}