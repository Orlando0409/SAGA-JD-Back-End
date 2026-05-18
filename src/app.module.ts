import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './Modules/auth/Auth.module';
import { JwtAuthGuard } from './Modules/auth/Guard/JwtGuard';
import { RolesGuard } from './Modules/auth/Guard/RolesGuards';
import { PermisosGuard } from './Modules/auth/Guard/PermisosGuard';
import { RolesModule } from './Modules/Usuarios/Modules/roles.module';
import { UsuariosModule } from './Modules/Usuarios/Modules/usuarios.module';
import { Permiso } from './Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from './Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from './Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { SugerenciaModule } from './Modules/Sugerencias/sugerencia.module';
import { QuejasModule } from './Modules/Quejas/quejas.module';
import { SeederModule } from './Config/Seeder.module';
import { Auditoria } from './Modules/Auditoria/AuditoriaEntities/Auditoria.Entities';
import { AuditoriaModule } from './Modules/Auditoria/auditoria.module';
import { ReportesModule } from './Modules/Reportes/reportes.module';
import { Reporte } from './Modules/Reportes/ReporteEntities/Reportes.Entity';
import { Sugerencia } from './Modules/Sugerencias/SugerenciaEntities/Sugerencia.Entity';
import { Queja } from './Modules/Quejas/QuejaEntities/QuejasEntity';
import { EstadoReporte } from './Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from './Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from './Modules/Quejas/QuejaEntities/EstadoQueja.Entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development'
        ? '.env.development'
        : '.env.production',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [
          Usuario, UsuarioRol, Permiso,
          Reporte, EstadoReporte,
          Sugerencia, EstadoSugerencia,
          Queja, EstadoQueja,
          Auditoria
        ],
        synchronize: false,
        dropSchema: false,
      })
    }),
    SeederModule,
    AuthModule,
    RolesModule,
    UsuariosModule,
    AuditoriaModule,
    ReportesModule,
    SugerenciaModule,
    QuejasModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, //  Autenticación JWT global
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, //  Verificación de roles global
    },
    {
      provide: APP_GUARD,
      useClass: PermisosGuard, //  Verificación de permisos global
    },
  ],
})
export class AppModule { }
