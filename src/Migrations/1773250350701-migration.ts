import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773250350701 implements MigrationInterface {
    name = 'Migration1773250350701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cargo_fijo_tarifas\` (\`Id_Cargo_Fijo_Tarifa\` int NOT NULL AUTO_INCREMENT, \`Cargo_Fijo_Por_Mes\` int NOT NULL, PRIMARY KEY (\`Id_Cargo_Fijo_Tarifa\`)) ENGINE=InnoDB`);

        // Mover Planos_Terreno y Escritura_Terreno de Afiliado → Medidor
        await queryRunner.query(`ALTER TABLE \`medidor\` ADD \`Planos_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`medidor\` ADD \`Escritura_Terreno\` varchar(500) NULL`);

        await queryRunner.query(`ALTER TABLE \`afiliado\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado\` DROP COLUMN \`Escritura_Terreno\``);

        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` DROP COLUMN \`Escritura_Terreno\``);

        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` DROP COLUMN \`Escritura_Terreno\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir: devolver columnas a Afiliado y quitarlas de Medidor
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` ADD \`Escritura_Terreno\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` ADD \`Planos_Terreno\` varchar(255) NOT NULL DEFAULT ''`);

        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` ADD \`Escritura_Terreno\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` ADD \`Planos_Terreno\` varchar(255) NOT NULL DEFAULT ''`);

        await queryRunner.query(`ALTER TABLE \`afiliado\` ADD \`Escritura_Terreno\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`afiliado\` ADD \`Planos_Terreno\` varchar(255) NOT NULL DEFAULT ''`);

        await queryRunner.query(`ALTER TABLE \`medidor\` DROP COLUMN \`Escritura_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`medidor\` DROP COLUMN \`Planos_Terreno\``);

        await queryRunner.query(`DROP TABLE \`cargo_fijo_tarifas\``);
    }

}
