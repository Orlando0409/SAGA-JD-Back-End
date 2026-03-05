import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772728546799 implements MigrationInterface {
    name = 'Migration1772728546799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`solicitud_agregar_medidor_fisica\` (\`Id_Solicitud\` int NOT NULL AUTO_INCREMENT, \`Tipo_Entidad\` enum ('1', '2') NOT NULL, \`Correo\` varchar(255) NOT NULL, \`Numero_Telefono\` varchar(255) NOT NULL, \`Fecha_Creacion\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`Fecha_Actualizacion\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`Id_Tipo_Solicitud\` int NOT NULL, \`Tipo_Identificacion\` enum ('Cedula Nacional', 'Dimex', 'Pasaporte', 'Cedula Juridica') NOT NULL, \`Identificacion\` varchar(20) NOT NULL, \`Nombre\` varchar(255) NOT NULL, \`Apellido1\` varchar(255) NOT NULL, \`Apellido2\` varchar(255) NOT NULL, \`Direccion_Exacta\` varchar(255) NOT NULL, \`Motivo_Solicitud\` varchar(255) NOT NULL, \`Id_Nuevo_Medidor\` int NULL, \`Id_Estado_Solicitud\` int NULL, PRIMARY KEY (\`Id_Solicitud\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`solicitud_agregar_medidor_juridica\` (\`Id_Solicitud\` int NOT NULL AUTO_INCREMENT, \`Tipo_Entidad\` enum ('1', '2') NOT NULL, \`Correo\` varchar(255) NOT NULL, \`Numero_Telefono\` varchar(255) NOT NULL, \`Fecha_Creacion\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`Fecha_Actualizacion\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`Id_Tipo_Solicitud\` int NOT NULL, \`Cedula_Juridica\` varchar(20) NOT NULL, \`Razon_Social\` varchar(255) NOT NULL, \`Direccion_Exacta\` varchar(255) NOT NULL, \`Motivo_Solicitud\` varchar(255) NOT NULL, \`Id_Nuevo_Medidor\` int NULL, \`Id_Estado_Solicitud\` int NULL, PRIMARY KEY (\`Id_Solicitud\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cargo_fijo_tarifas\` (\`Id_Cargo_Fijo_Tarifa\` int NOT NULL AUTO_INCREMENT, \`Cargo_Fijo_Por_Mes\` int NOT NULL, PRIMARY KEY (\`Id_Cargo_Fijo_Tarifa\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP COLUMN \`Numero_Medidor_Anterior\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP COLUMN \`Numero_Medidor_Anterior\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` ADD \`Id_Medidor\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD \`Id_Medidor\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD \`Id_Nuevo_Medidor\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` ADD \`Id_Medidor\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD \`Id_Medidor\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD \`Id_Nuevo_Medidor\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`sugerencias\` ADD CONSTRAINT \`FK_5049651b29fba535d3401a32ea6\` FOREIGN KEY (\`Id_Estado_Sugerencia\`) REFERENCES \`estado_sugerencia\`(\`Id_Estado_Sugerencia\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` ADD CONSTRAINT \`FK_748cda9f98bd4bea86924d671bb\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` ADD CONSTRAINT \`FK_91a4f7afb65649518c9eef1a91b\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD CONSTRAINT \`FK_0e474f1c3ae13e85a5233af5657\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD CONSTRAINT \`FK_f76728505539abb2b3a67e5a7b4\` FOREIGN KEY (\`Id_Medidor\`) REFERENCES \`medidor\`(\`Id_Medidor\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD CONSTRAINT \`FK_9fb2eed56fbf14d0a95b4ffe686\` FOREIGN KEY (\`Id_Nuevo_Medidor\`) REFERENCES \`medidor\`(\`Id_Medidor\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` ADD CONSTRAINT \`FK_b28dd55c88a0e3d88f2b6472243\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` ADD CONSTRAINT \`FK_788b49d100e02d83f7269e63b71\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` ADD CONSTRAINT \`FK_621c4d75f6dfb7f369a17745048\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD CONSTRAINT \`FK_08460f559d052991a29ba7676ab\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD CONSTRAINT \`FK_634316d59dbe0ecbbc2fcabb2c0\` FOREIGN KEY (\`Id_Medidor\`) REFERENCES \`medidor\`(\`Id_Medidor\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD CONSTRAINT \`FK_5846f1b4a7ff4bf694036d336ce\` FOREIGN KEY (\`Id_Nuevo_Medidor\`) REFERENCES \`medidor\`(\`Id_Medidor\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` ADD CONSTRAINT \`FK_cdb0f2b8f2c3711f245338b073b\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` ADD CONSTRAINT \`FK_1596888504a815f700cffcc56cc\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` ADD CONSTRAINT \`FK_77aa528dd160ccec9567ae3d621\` FOREIGN KEY (\`Id_Nuevo_Medidor\`) REFERENCES \`medidor\`(\`Id_Medidor\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` ADD CONSTRAINT \`FK_9c0b1bd9e8c293177f659539cc5\` FOREIGN KEY (\`Id_Estado_Solicitud\`) REFERENCES \`estado_solicitud\`(\`Id_Estado_Solicitud\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` ADD CONSTRAINT \`FK_51f0d014f27338a18084d8504fd\` FOREIGN KEY (\`Id_Nuevo_Medidor\`) REFERENCES \`medidor\`(\`Id_Medidor\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reportes\` ADD CONSTRAINT \`FK_817921a4c1aa17009427632544e\` FOREIGN KEY (\`Id_Estado_Reporte\`) REFERENCES \`estado_reporte\`(\`Id_Estado_Reporte\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`manuales\` ADD CONSTRAINT \`FK_c622f17c26f5a76fffe054e79b9\` FOREIGN KEY (\`Id_Usuario\`) REFERENCES \`usuario\`(\`Id_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tipo_tarifa_servicios_fijos\` ADD CONSTRAINT \`FK_0f77cd4123e424c659a5cf0c196\` FOREIGN KEY (\`Id_Tipo_Tarifa_Lectura\`) REFERENCES \`tipo_tarifa_lectura\`(\`Id_Tipo_Tarifa_Lectura\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rango_consumo\` ADD CONSTRAINT \`FK_7b3b753f080b6c6031a15393bec\` FOREIGN KEY (\`Id_Tipo_Tarifa_Lectura\`) REFERENCES \`tipo_tarifa_lectura\`(\`Id_Tipo_Tarifa_Lectura\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rango_afiliados\` ADD CONSTRAINT \`FK_9492186bc44cb799193e1ed3260\` FOREIGN KEY (\`Id_Tipo_Tarifa_Lectura\`) REFERENCES \`tipo_tarifa_lectura\`(\`Id_Tipo_Tarifa_Lectura\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`imagenes\` ADD CONSTRAINT \`FK_105df48281be7f27485e6a70e58\` FOREIGN KEY (\`Id_Usuario\`) REFERENCES \`usuario\`(\`Id_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`faq\` ADD CONSTRAINT \`FK_69468055c01e422d1038c6c9c42\` FOREIGN KEY (\`Id_Usuario\`) REFERENCES \`usuario\`(\`Id_Usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rol_permiso\` ADD CONSTRAINT \`FK_dca6059b5b8bb48e50362bca4ca\` FOREIGN KEY (\`Id_Rol\`) REFERENCES \`usuario_rol\`(\`Id_Rol\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rol_permiso\` ADD CONSTRAINT \`FK_3f41d6d4a9735714b5671316e01\` FOREIGN KEY (\`Id_Permiso\`) REFERENCES \`permisos\`(\`Id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rol_permiso\` DROP FOREIGN KEY \`FK_3f41d6d4a9735714b5671316e01\``);
        await queryRunner.query(`ALTER TABLE \`rol_permiso\` DROP FOREIGN KEY \`FK_dca6059b5b8bb48e50362bca4ca\``);
        await queryRunner.query(`ALTER TABLE \`faq\` DROP FOREIGN KEY \`FK_69468055c01e422d1038c6c9c42\``);
        await queryRunner.query(`ALTER TABLE \`imagenes\` DROP FOREIGN KEY \`FK_105df48281be7f27485e6a70e58\``);
        await queryRunner.query(`ALTER TABLE \`rango_afiliados\` DROP FOREIGN KEY \`FK_9492186bc44cb799193e1ed3260\``);
        await queryRunner.query(`ALTER TABLE \`rango_consumo\` DROP FOREIGN KEY \`FK_7b3b753f080b6c6031a15393bec\``);
        await queryRunner.query(`ALTER TABLE \`tipo_tarifa_servicios_fijos\` DROP FOREIGN KEY \`FK_0f77cd4123e424c659a5cf0c196\``);
        await queryRunner.query(`ALTER TABLE \`manuales\` DROP FOREIGN KEY \`FK_c622f17c26f5a76fffe054e79b9\``);
        await queryRunner.query(`ALTER TABLE \`reportes\` DROP FOREIGN KEY \`FK_817921a4c1aa17009427632544e\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` DROP FOREIGN KEY \`FK_51f0d014f27338a18084d8504fd\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_juridica\` DROP FOREIGN KEY \`FK_9c0b1bd9e8c293177f659539cc5\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` DROP FOREIGN KEY \`FK_77aa528dd160ccec9567ae3d621\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_agregar_medidor_fisica\` DROP FOREIGN KEY \`FK_1596888504a815f700cffcc56cc\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_juridica\` DROP FOREIGN KEY \`FK_cdb0f2b8f2c3711f245338b073b\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP FOREIGN KEY \`FK_5846f1b4a7ff4bf694036d336ce\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP FOREIGN KEY \`FK_634316d59dbe0ecbbc2fcabb2c0\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP FOREIGN KEY \`FK_08460f559d052991a29ba7676ab\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` DROP FOREIGN KEY \`FK_621c4d75f6dfb7f369a17745048\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_juridica\` DROP FOREIGN KEY \`FK_788b49d100e02d83f7269e63b71\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_asociado_fisica\` DROP FOREIGN KEY \`FK_b28dd55c88a0e3d88f2b6472243\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP FOREIGN KEY \`FK_9fb2eed56fbf14d0a95b4ffe686\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP FOREIGN KEY \`FK_f76728505539abb2b3a67e5a7b4\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP FOREIGN KEY \`FK_0e474f1c3ae13e85a5233af5657\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` DROP FOREIGN KEY \`FK_91a4f7afb65649518c9eef1a91b\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_afiliacion_fisica\` DROP FOREIGN KEY \`FK_748cda9f98bd4bea86924d671bb\``);
        await queryRunner.query(`ALTER TABLE \`sugerencias\` DROP FOREIGN KEY \`FK_5049651b29fba535d3401a32ea6\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP COLUMN \`Id_Nuevo_Medidor\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` DROP COLUMN \`Id_Medidor\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_juridica\` DROP COLUMN \`Id_Medidor\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP COLUMN \`Id_Nuevo_Medidor\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` DROP COLUMN \`Id_Medidor\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_desconexion_fisica\` DROP COLUMN \`Id_Medidor\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_juridica\` ADD \`Numero_Medidor_Anterior\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`solicitud_cambio_medidor_fisica\` ADD \`Numero_Medidor_Anterior\` int NOT NULL`);
        await queryRunner.query(`DROP TABLE \`cargo_fijo_tarifas\``);
        await queryRunner.query(`DROP TABLE \`solicitud_agregar_medidor_juridica\``);
        await queryRunner.query(`DROP TABLE \`solicitud_agregar_medidor_fisica\``);
    }

}
