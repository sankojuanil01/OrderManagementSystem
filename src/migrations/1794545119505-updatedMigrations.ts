import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedMigrations1794545119505 implements MigrationInterface {
    name = 'UpdatedMigrations1794545119505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL`);
    }

}
