import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774506700718 implements MigrationInterface {
    name = 'Migration1774506700718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medidor\` ADD \`Estado_Pago\` enum ('Libre', 'Pagado', 'Pendiente') NOT NULL DEFAULT 'Libre'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medidor\` DROP COLUMN \`Estado_Pago\``);
    }

}
