import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774464211264 implements MigrationInterface {
    name = 'Migration1774464211264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`afiliado\` CHANGE \`Escritura_Terreno\` \`Escrituras_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` CHANGE \`Escritura_Terreno\` \`Escrituras_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` CHANGE \`Escritura_Terreno\` \`Escrituras_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` CHANGE \`Escritura_Terreno\` \`Escrituras_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` CHANGE \`Escritura_Terreno\` \`Escrituras_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` DROP COLUMN \`Certificacion_Literal\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` ADD \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` CHANGE \`Escrituras_Terreno\` \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` CHANGE \`Escrituras_Terreno\` \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` CHANGE \`Escrituras_Terreno\` \`Escritura_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` CHANGE \`Escrituras_Terreno\` \`Escritura_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado\` CHANGE \`Escrituras_Terreno\` \`Escritura_Terreno\` varchar(500) NULL`);
    }

}
