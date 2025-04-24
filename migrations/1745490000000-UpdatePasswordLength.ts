import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePasswordLength1745490000000 implements MigrationInterface {
    name = 'UpdatePasswordLength1745490000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" TYPE character varying(60)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" TYPE character varying(50)`);
    }
} 