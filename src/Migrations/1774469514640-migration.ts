import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774469514640 implements MigrationInterface {
    name = 'Migration1774469514640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` CHANGE \`Escritura_Terreno\` \`Certificacion_Literal\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado\` ADD \`Planos_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado\` ADD \`Escrituras_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` ADD \`Planos_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` ADD \`Escrituras_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` ADD \`Planos_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` ADD \`Escrituras_Terreno\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` ADD \`Planos_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` ADD \`Escrituras_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` ADD \`Planos_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` ADD \`Escrituras_Terreno\` varchar(500) NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` DROP COLUMN \`Escrituras_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` DROP COLUMN \`Escrituras_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` DROP COLUMN \`Escrituras_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado_juridico\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` DROP COLUMN \`Escrituras_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado_fisico\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado\` DROP COLUMN \`Escrituras_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`afiliado\` DROP COLUMN \`Planos_Terreno\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` CHANGE \`Certificacion_Literal\` \`Escritura_Terreno\` varchar(255) NOT NULL`);
    }

}
