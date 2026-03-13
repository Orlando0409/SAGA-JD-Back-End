import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773432300343 implements MigrationInterface {
    name = 'Migration1773432300343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cargo_fijo_tarifas\` (\`Id_Cargo_Fijo_Tarifa\` int NOT NULL AUTO_INCREMENT, \`Cargo_Fijo_Por_Mes\` int NOT NULL, PRIMARY KEY (\`Id_Cargo_Fijo_Tarifa\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`cargo_fijo_tarifas\``);
    }

}
