import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773105169632 implements MigrationInterface {
    name = 'Migration1773105169632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`proyecto\` DROP COLUMN \`Descripcion\``);
        await queryRunner.query(`ALTER TABLE \`proyecto\` ADD \`Descripcion\` varchar(1000) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`proyecto\` DROP COLUMN \`Descripcion\``);
        await queryRunner.query(`ALTER TABLE \`proyecto\` ADD \`Descripcion\` varchar(255) NOT NULL`);
    }

}
