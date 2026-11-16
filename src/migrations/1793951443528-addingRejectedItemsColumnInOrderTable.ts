import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingRejectedItemsColumnInOrderTable1793951443528 implements MigrationInterface {
    name = 'AddingRejectedItemsColumnInOrderTable1793951443528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "rejectedItems" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "rejectedItems"`);
    }

}
