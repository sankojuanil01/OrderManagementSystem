import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatesInEntity1794842837251 implements MigrationInterface {
    name = 'UpdatesInEntity1794842837251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_management"."modifiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "priceAdjustment" numeric(12,2) NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "modifier_group_id" uuid NOT NULL, CONSTRAINT "PK_f4d68e3a0c8a835c06a9fa27f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_management"."modifier_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "isRequired" boolean NOT NULL DEFAULT false, "minSelect" integer NOT NULL DEFAULT '0', "maxSelect" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product_id" integer NOT NULL, CONSTRAINT "PK_b3cea1c985339de5ea73d77101d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item_modifiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "modifierName" character varying NOT NULL, "modifierPrice" numeric(12,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "order_item_id" integer NOT NULL, "modifierId" uuid, CONSTRAINT "PK_e87d8ed07e34e0bd3cdc8f64ec8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_management"."modifiers" ADD CONSTRAINT "FK_976916f1dcbd1a542303d19378d" FOREIGN KEY ("modifier_group_id") REFERENCES "order_management"."modifier_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_management"."modifier_groups" ADD CONSTRAINT "FK_32eadb1f83c1d3e3a2bfd82ddd7" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "FK_1f6709a805b8bcafe0bda11edbf" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "FK_1eb9a907495da3a71166136e100" FOREIGN KEY ("modifierId") REFERENCES "order_management"."modifiers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item_modifiers" DROP CONSTRAINT "FK_1eb9a907495da3a71166136e100"`);
        await queryRunner.query(`ALTER TABLE "order_item_modifiers" DROP CONSTRAINT "FK_1f6709a805b8bcafe0bda11edbf"`);
        await queryRunner.query(`ALTER TABLE "order_management"."modifier_groups" DROP CONSTRAINT "FK_32eadb1f83c1d3e3a2bfd82ddd7"`);
        await queryRunner.query(`ALTER TABLE "order_management"."modifiers" DROP CONSTRAINT "FK_976916f1dcbd1a542303d19378d"`);
        await queryRunner.query(`DROP TABLE "order_item_modifiers"`);
        await queryRunner.query(`DROP TABLE "order_management"."modifier_groups"`);
        await queryRunner.query(`DROP TABLE "order_management"."modifiers"`);
    }

}
