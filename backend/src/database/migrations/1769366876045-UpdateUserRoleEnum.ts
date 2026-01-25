import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleEnum1769366876045 implements MigrationInterface {
    name = 'UpdateUserRoleEnum1769366876045'
    transaction = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add 'user' to the enum type
        // Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some Postgres versions.
        // TypeORM runs migrations in transactions by default. 
        // We use a trick to run it if needed, or we just do it.
        await queryRunner.query(`ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'user'`);

        // 2. Update existing records
        await queryRunner.query(`UPDATE "users" SET "role" = 'user' WHERE "role" IN ('instructor', 'learner')`);

        // 3. Set the new default
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverting this is tricky because you can't easily remove a value from an enum in Postgres
        // without dropping and recreating it. For now, we'll just set the default back.
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'learner'`);
    }

}
