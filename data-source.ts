import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import 'reflect-metadata';

// Cargar el archivo .env correcto según el entorno
const envFile = process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development';

config({ path: envFile });

const configService = new ConfigService();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: configService.get("DB_HOST"),
    port: configService.get("DB_PORT"),
    username: configService.get("DB_USERNAME"),
    password: configService.get("DB_PASSWORD"),
    database: configService.get("DB_DATABASE"),
    entities: ["src/**/*.Entity{.ts,.js}"],
    migrations: ["src/Migrations/**/*{.ts,.js}"],
    synchronize: false,
    migrationsRun: true,
    dropSchema: false,
});

// buscar informacion sobre migraciones en cascada o incrementales