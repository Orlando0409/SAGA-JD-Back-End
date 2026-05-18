import { Injectable, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { Auditoria } from "./AuditoriaEntities/Auditoria.Entities";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";
import { Reporte } from "../Reportes/ReporteEntities/Reportes.Entity";
import { Queja } from "../Quejas/QuejaEntities/QuejasEntity";
import { Sugerencia } from "../Sugerencias/SugerenciaEntities/Sugerencia.Entity";

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(Auditoria)
        private readonly auditoriaRepository: Repository<Auditoria>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @Inject(forwardRef(() => UsuariosService))
        private readonly usuariosService: UsuariosService,

        private readonly dataSource: DataSource,
    ) { }

    /*
        Obtiene el nombre del registro según el módulo y los datos
        Para UPDATE/DELETE usa datos anteriores, para INSERT usa datos nuevos
    */
    private async obtenerNombreRegistro(modulo: string, idRegistro: number, datosAnteriores: string | null, datosNuevos: string, accion: string): Promise<string> {
        try {
            // Para Actualización y Eliminación, intentar obtener el nombre de los datos anteriores
            if ((accion === 'Actualización' || accion === 'Eliminación') && datosAnteriores) {
                try {
                    const anteriores = JSON.parse(datosAnteriores);

                    // Buscar el campo de nombre según el módulo
                    switch (modulo.toLowerCase()) {
                        case 'usuarios':
                            if (anteriores.Nombre_Usuario) return anteriores.Nombre_Usuario;
                            break;

                        case 'roles':
                            if (anteriores.Nombre_Rol) return anteriores.Nombre_Rol;
                            break;

                        case 'categorias':
                            if (anteriores.Nombre_Categoria) return anteriores.Nombre_Categoria;
                            break;

                        case 'unidades de medicion':
                            if (anteriores.Nombre_Unidad) return anteriores.Nombre_Unidad;
                            break;

                        case 'materiales':
                            if (anteriores.Nombre_Material) return anteriores.Nombre_Material;
                            break;

                        case 'proveedores':
                            if (anteriores.Nombre_Proveedor) return anteriores.Nombre_Proveedor;
                            break;

                        case 'proyectos':
                            if (anteriores.Titulo) return anteriores.Titulo;
                            break;

                        case 'actas':
                            if (anteriores.Titulo) return anteriores.Titulo;
                            break;

                        case 'actas-archivo':
                            if (anteriores.Nombre_Archivo) return anteriores.Nombre_Archivo;
                            break;

                        case 'calidad de agua':
                            if (anteriores.Titulo) return anteriores.Titulo;
                            break;

                        case 'solicitudes':
                            if (anteriores.Correo) return anteriores.Correo;
                            break;

                        case 'medidores':
                            if (anteriores.Numero_Medidor) return anteriores.Numero_Medidor;
                            break;

                        case 'lecturas':
                            if (anteriores.Numero_Medidor) return anteriores.Numero_Medidor;
                            break;

                        case 'faq':
                            if (anteriores.Pregunta) return anteriores.Pregunta;
                            break;

                        case 'edicion de imagenes':
                            if (anteriores.Nombre_Imagen) return anteriores.Nombre_Imagen;
                            break;

                        case 'manuales de usuario':
                            if (anteriores.Nombre_Manual) return anteriores.Nombre_Manual;
                            break;

                        case 'sugerencias':
                            if (anteriores.Mensaje) return anteriores.Mensaje;
                            break;

                        case 'quejas':
                            if (anteriores.Descripcion) return anteriores.Descripcion;
                            break;

                        case 'reportes':
                            if (anteriores.Ubicacion) return anteriores.Ubicacion;
                            break;

                        case 'autenticación':
                            if (anteriores.Nombre_Usuario) return anteriores.Nombre_Usuario;
                            break;

                        case 'afiliado físico':
                            if (anteriores.Identificacion) return anteriores.Identificacion;
                            break;

                        case 'afiliado jurídico':
                            if (anteriores.Cedula_Juridica) return anteriores.Cedula_Juridica;
                            break;

                        case 'movimientos':
                            if (anteriores.Nombre_Material) return anteriores.Nombre_Material;
                            if (anteriores.Registro_Afectado) return anteriores.Registro_Afectado;
                            break;
                    }
                } catch (error) {
                    console.error('Error al parsear datos anteriores:', error);
                }
            }

            // Para CREACIÓN, intentar obtener el nombre de los datos nuevos
            if (accion === 'Creación' && datosNuevos) {
                try {
                    const nuevos = JSON.parse(datosNuevos);

                    switch (modulo.toLowerCase()) {
                        case 'usuario':
                            if (nuevos.Nombre_Usuario) return nuevos.Nombre_Usuario;
                            break;

                        case 'roles':
                            if (nuevos.Nombre_Rol) return nuevos.Nombre_Rol;
                            break;

                        case 'categorias':
                            if (nuevos.Nombre_Categoria) return nuevos.Nombre_Categoria;
                            break;

                        case 'unidades de medicion':
                            if (nuevos.Nombre_Unidad) return nuevos.Nombre_Unidad;
                            break;

                        case 'materiales':
                            if (nuevos.Nombre_Material) return nuevos.Nombre_Material;
                            break;

                        case 'proveedores':
                            if (nuevos.Nombre_Proveedor) return nuevos.Nombre_Proveedor;
                            break;

                        case 'proyectos':
                            if (nuevos.Titulo) return nuevos.Titulo;
                            break;

                        case 'actas':
                            if (nuevos.Titulo) return nuevos.Titulo;
                            break;

                        case 'actas-archivo':
                            if (nuevos.Nombre_Archivo) return nuevos.Nombre_Archivo;
                            break;

                        case 'calidad de agua':
                            if (nuevos.Titulo) return nuevos.Titulo;
                            break;

                        case 'solicitudes':
                            if (nuevos.Correo) return nuevos.Correo;
                            break;

                        case 'medidores':
                            if (nuevos.Numero_Medidor) return nuevos.Numero_Medidor;
                            break;

                        case 'movimientos':
                            if (nuevos.Nombre_Material) return nuevos.Nombre_Material;
                            if (nuevos.Registro_Afectado) return nuevos.Registro_Afectado;
                            break;

                        case 'lecturas':
                            if (nuevos.Numero_Medidor) return nuevos.Numero_Medidor;
                            break;

                        case 'faq':
                            if (nuevos.Pregunta) return nuevos.Pregunta;
                            break;

                        case 'edicion de imagenes':
                            if (nuevos.Nombre_Imagen) return nuevos.Nombre_Imagen;
                            break;

                        case 'manuales de usuario':
                            if (nuevos.Nombre_Manual) return nuevos.Nombre_Manual;
                            break;

                        case 'sugerencias':
                            if (nuevos.Mensaje) return nuevos.Mensaje;
                            break;

                        case 'quejas':
                            if (nuevos.Descripcion) return nuevos.Descripcion;
                            break;

                        case 'reportes':
                            if (nuevos.Ubicacion) return nuevos.Ubicacion;
                            break;

                        case 'autenticación':
                            if (nuevos.Nombre_Usuario) return nuevos.Nombre_Usuario;
                            break;

                        case 'afiliado físico':
                            if (nuevos.Identificacion) return nuevos.Identificacion;
                            break;

                        case 'afiliado jurídico':
                            if (nuevos.Cedula_Juridica) return nuevos.Cedula_Juridica;
                            break;
                    }
                } catch (error) {
                    console.error('Error al parsear datos nuevos:', error);
                }
            }

            // Si no se pudo obtener de los datos JSON, hacer query a la base de datos como fallback
            switch (modulo.toLowerCase()) {
                
                case 'usuario':
                    const usuario = await this.usuarioRepository.findOne({
                        where: { Id_Usuario: idRegistro }
                    });
                    return usuario?.Nombre_Usuario || `Usuario ID: ${idRegistro}`;

                case 'calidad de agua':
                case 'faq':
                    const faq = await this.dataSource.getRepository('FAQEntity').findOne({
                        where: { Id_FAQ: idRegistro }
                    });
                    return faq?.Pregunta || `FAQ ID: ${idRegistro}`;

                case 'reportes':
                    const reporte = await this.dataSource.getRepository(Reporte).findOne({
                        where: { Id_Reporte: idRegistro }
                    });
                    return reporte?.Ubicacion || `Reporte ID: ${idRegistro}`;

                case 'quejas':
                    const queja = await this.dataSource.getRepository(Queja).findOne({
                        where: { Id_Queja: idRegistro }
                    });
                    return queja?.Descripcion || `Queja ID: ${idRegistro}`;

                case 'sugerencias':
                    const sugerencia = await this.dataSource.getRepository(Sugerencia).findOne({
                        where: { Id_Sugerencia: idRegistro }
                    });
                    return sugerencia?.Mensaje || `Sugerencia ID: ${idRegistro}`;

                case 'autenticación':
                    const usuarioAuth = await this.usuarioRepository.findOne({
                        where: { Id_Usuario: idRegistro }
                    });
                    return usuarioAuth?.Nombre_Usuario || `Usuario ID: ${idRegistro}`;

                default:
                    return `Registro ID: ${idRegistro}`;
            }
        } catch (error) {
            console.error(`Error al obtener nombre del registro para módulo ${modulo}:`, error);
            return `Registro ID: ${idRegistro}`;
        }
    }

    async getAuditorias() {
        const auditorias = await this.auditoriaRepository.createQueryBuilder('auditoria')
            .leftJoinAndSelect('auditoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .orderBy('auditoria.Fecha_Accion', 'DESC')
            .getMany();

        // Usar Promise.all para obtener nombres de registros de forma paralela
        return Promise.all(auditorias.map(async (auditoria) => {
            // Obtener el nombre del registro (usa datos anteriores para UPDATE/DELETE, datos nuevos para INSERT)
            const nombreRegistro = await this.obtenerNombreRegistro(
                auditoria.Modulo,
                auditoria.Id_Registro,
                auditoria.Datos_Anteriores,
                auditoria.Datos_Nuevos,
                auditoria.Accion
            );

            return {
                Id_Auditoria: auditoria.Id_Auditoria,
                Modulo: auditoria.Modulo,
                Accion: auditoria.Accion,
                Registro_Afectado: nombreRegistro, // Nombre legible del registro
                Fecha_Accion: auditoria.Fecha_Accion,
                Usuario: auditoria.Usuario ? {
                    Id_Usuario: auditoria.Usuario.Id_Usuario,
                    Nombre_Usuario: auditoria.Usuario.Nombre_Usuario,
                    Id_Rol: auditoria.Usuario.Id_Rol,
                    Nombre_Rol: auditoria.Usuario.Rol?.Nombre_Rol
                } : null,
                // Datos completos en JSON
                Datos_Anteriores: auditoria.Datos_Anteriores,
                Datos_Nuevos: auditoria.Datos_Nuevos
            };
        }));
    }

    // Métodos de consulta
    async getAuditoriasPorModulo(modulo: string) {
        if (!modulo || modulo.trim() === '') throw new BadRequestException('Debe proporcionar un nombre de módulo válido');

        const auditorias = await this.auditoriaRepository.find({
            where: { Modulo: modulo },
            relations: ['Usuario', 'Usuario.Rol'],
            order: { Fecha_Accion: 'DESC' }
        });

        return Promise.all(auditorias.map(async (auditoria) => ({
            ...auditoria,
            Usuario: auditoria.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(auditoria.Usuario) : null
        })));
    }

    async getAuditoriasPorUsuario(usuarioId: number) {
        if (!usuarioId || usuarioId <= 0) throw new BadRequestException('Debe proporcionar un ID de usuario válido');

        const auditorias = await this.auditoriaRepository.find({
            where: { Usuario: { Id_Usuario: usuarioId } },
            relations: ['Usuario', 'Usuario.Rol'],
            order: { Fecha_Accion: 'DESC' }
        });

        return Promise.all(auditorias.map(async (auditoria) => ({
            ...auditoria,
            Usuario: auditoria.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(auditoria.Usuario) : null
        })));
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
        return this.createAuditoria(modulo, 'Creación', usuarioId, idRegistro, null, datosNuevos);
    }

    async logActualizacion(modulo: string, usuarioId: number, idRegistro: number, datosAnteriores: any, datosNuevos: any): Promise<Auditoria> {
        return this.createAuditoria(modulo, 'Actualización', usuarioId, idRegistro, datosAnteriores, datosNuevos);
    }

    async logEliminacion(modulo: string, usuarioId: number, idRegistro: number, datosAnteriores: any): Promise<Auditoria> {
        return this.createAuditoria(modulo, 'Eliminación', usuarioId, idRegistro, datosAnteriores, null);
    }

    async logAutenticacion(accion: 'Login' | 'Logout', usuarioId: number, datosAdicionales?: any): Promise<Auditoria> {
        return this.createAuditoria('Autenticación', accion, usuarioId, usuarioId, null, datosAdicionales || {});
    }
}