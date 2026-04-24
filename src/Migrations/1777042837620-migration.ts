import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777042837620 implements MigrationInterface {
    name = 'Migration1777042837620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`factura\` ADD \`Nombre_Completo_Afiliado\` varchar(255) NULL COMMENT 'Nombre completo o razón social del afiliado al momento de facturación'`);
        await queryRunner.query(`ALTER TABLE \`factura\` ADD \`Identificacion_Afiliado\` varchar(50) NULL COMMENT 'Identificación o cédula jurídica del afiliado al momento de facturación'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`factura\` DROP COLUMN \`Identificacion_Afiliado\``);
        await queryRunner.query(`ALTER TABLE \`factura\` DROP COLUMN \`Nombre_Completo_Afiliado\``);
    }

}
