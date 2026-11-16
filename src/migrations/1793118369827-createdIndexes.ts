
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedIndexes1793118369827
  implements MigrationInterface
{
  name = 'CreatedIndexes1793118369827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "idx_order_items_product_id"
      ON "order_items" ("product_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_items_order_id"
      ON "order_items" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_orders_status"
      ON "orders" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_orders_user_created_at"
      ON "orders" ("user_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_products_created_at"
      ON "products" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_products_status"
      ON "products" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_products_price"
      ON "products" ("price")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_products_name"
      ON "products" ("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_name"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_price"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_orders_user_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_orders_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_items_order_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_items_product_id"`,
    );
  }
}
