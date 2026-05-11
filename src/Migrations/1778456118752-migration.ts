import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778456118752 implements MigrationInterface {
    name = 'Migration1778456118752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lectura\` DROP FOREIGN KEY \`FK_a0b7e6aa2a21acb6031df19add3\``);
        await queryRunner.query(`ALTER TABLE \`lectura\` ADD CONSTRAINT \`FK_a0b7e6aa2a21acb6031df19add3\` FOREIGN KEY (\`Id_Tarifa_Lectura\`) REFERENCES \`tarifa_lectura_sin_sello\`(\`Id_Tarifa_Lectura\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lectura\` DROP FOREIGN KEY \`FK_a0b7e6aa2a21acb6031df19add3\``);
        await queryRunner.query(`ALTER TABLE \`lectura\` ADD CONSTRAINT \`FK_a0b7e6aa2a21acb6031df19add3\` FOREIGN KEY (\`Id_Tarifa_Lectura\`) REFERENCES \`tarifa_lectura_con_sello\`(\`Id_Tarifa_Lectura\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
