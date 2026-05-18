import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from 'src/Modules/Usuarios/UsuarioEntities/Permiso.Entity';
import { Usuario } from 'src/Modules/Usuarios/UsuarioEntities/Usuario.Entity';
import { UsuarioRol } from 'src/Modules/Usuarios/UsuarioEntities/UsuarioRol.Entity';
import { SeederService } from './Seeder.service';
import { EstadoReporte } from 'src/Modules/Reportes/ReporteEntities/EstadoReporte.Entity';
import { EstadoSugerencia } from 'src/Modules/Sugerencias/SugerenciaEntities/EstadoSugerencia.Entity';
import { EstadoQueja } from 'src/Modules/Quejas/QuejaEntities/EstadoQueja.Entity';
@Module({
    imports: [TypeOrmModule.forFeature([
        Usuario, 
        UsuarioRol, 
        Permiso, 
        EstadoReporte, 
        EstadoSugerencia, 
        EstadoQueja
    ])],
    providers: [SeederService],
    exports: [SeederService]
})
export class SeederModule { }