import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { Auditoria } from "./AuditoriaEntities/Auditoria.Entities";

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(Auditoria)
        private readonly auditoriaRepository: Repository<Auditoria>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async getAuditorias() {
        const auditorias = await this.auditoriaRepository.createQueryBuilder('auditoria')
            .leftJoinAndSelect('auditoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .orderBy('auditoria.Fecha_Accion', 'DESC')
            .getMany();

        return auditorias.map(auditoria => ({
            ...auditoria,
            Usuario: auditoria.Usuario ? {
                Id_Usuario: auditoria.Usuario.Id_Usuario,
                Nombre_Usuario: auditoria.Usuario.Nombre_Usuario,
                Id_Rol: auditoria.Usuario.Id_Rol,
                Nombre_Rol: auditoria.Usuario.Rol.Nombre_Rol
            } : null
        }));
    }

    async createAuditoria(modulo: string, accion: string, usuarioId: number, idRegistro: number, datosAnteriores?: any, datosNuevos?: any): Promise<Auditoria> {
        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: usuarioId } });
        if (!usuario) { throw new Error('Usuario no encontrado'); }

        const nuevaAuditoria = new Auditoria();
        nuevaAuditoria.Modulo = modulo;
        nuevaAuditoria.Accion = accion;
        nuevaAuditoria.Id_Registro = idRegistro;
        nuevaAuditoria.Datos_Anteriores = datosAnteriores ? JSON.stringify(datosAnteriores) : '';
        nuevaAuditoria.Datos_Nuevos = datosNuevos ? JSON.stringify(datosNuevos) : '';
        nuevaAuditoria.Usuario = usuario;
        
        return await this.auditoriaRepository.save(nuevaAuditoria);
    }

    // Métodos helper para las operaciones más comunes
    async logCreacion(modulo: string, usuarioId: number, idRegistro: number, datosNuevos: any): Promise<Auditoria> {
        return this.createAuditoria(modulo, 'Insert', usuarioId, idRegistro, null, datosNuevos);
    }

    async logActualizacion(modulo: string, usuarioId: number, idRegistro: number, datosAnteriores: any, datosNuevos: any): Promise<Auditoria> {
        return this.createAuditoria(modulo, 'Update', usuarioId, idRegistro, datosAnteriores, datosNuevos);
    }

    async logEliminacion(modulo: string, usuarioId: number, idRegistro: number, datosAnteriores: any): Promise<Auditoria> {
        return this.createAuditoria(modulo, 'Delete', usuarioId, idRegistro, datosAnteriores, null);
    }

    // Métodos de consulta
    async getAuditoriasPorModulo(modulo: string): Promise<Auditoria[]> {
        return this.auditoriaRepository.find({ where: { Modulo: modulo }, relations: ['Usuario'], order: { Fecha_Accion: 'DESC' } });
    }

    async getAuditoriasPorUsuario(usuarioId: number): Promise<Auditoria[]> {
        return this.auditoriaRepository.find({where: { Usuario: { Id_Usuario: usuarioId } }, relations: ['Usuario'], order: { Fecha_Accion: 'DESC' } });
    }

    async getAuditoriasPorRegistro(modulo: string, idRegistro: number): Promise<Auditoria[]> {
        return this.auditoriaRepository.find({ where: { Modulo: modulo, Id_Registro: idRegistro }, relations: ['Usuario'], order: { Fecha_Accion: 'DESC' } });
    }
}