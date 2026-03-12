import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773262184270 implements MigrationInterface {
    name = 'Migration1773262184270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cargo_fijo_tarifas\` (\`Id_Cargo_Fijo_Tarifa\` int NOT NULL AUTO_INCREMENT, \`Cargo_Fijo_Por_Mes\` int NOT NULL, PRIMARY KEY (\`Id_Cargo_Fijo_Tarifa\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD \`Planos_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD \`Planos_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD \`Escritura_Terreno\` varchar(500) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP COLUMN \`Escritura_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP COLUMN \`Escritura_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`DROP TABLE \`cargo_fijo_tarifas\``);
    }

}
