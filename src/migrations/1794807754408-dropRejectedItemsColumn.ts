import { MigrationInterface, QueryRunner } from "typeorm";

export class DropRejectedItemsColumn1794807754408 implements MigrationInterface {
    name = 'DropRejectedItemsColumn1794807754408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "rejectedItems"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "rejectedItems" jsonb`);
    }

}
