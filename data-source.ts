import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import 'reflect-metadata';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: configService.get("DB_HOST"),
    port: configService.get("DB_PORT"),
    username: configService.get("DB_USERNAME"),
    password: configService.get("DB_PASSWORD"),
    database: configService.get("DB_DATABASE"),
    entities: [__dirname + '/src/**/*.Entity.{ts,js}'],
    migrations: [__dirname + '/src/Migrations/*.{ts,js}'],
    synchronize: false,
});