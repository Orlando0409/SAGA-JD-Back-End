import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { Auditoria } from "./AuditoriaEntities/Auditoria.Entities";
import { Categoria } from "../Inventario/InventarioEntities/Categoria.Entity";
import { UnidadMedicion } from "../Inventario/InventarioEntities/UnidadMedicion.Entity";
import { Material } from "../Inventario/InventarioEntities/Material.Entity";
import { Proveedor } from "../Proveedores/ProveedorEntities/Proveedor.Entity";

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(Auditoria)
        private readonly auditoriaRepository: Repository<Auditoria>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dataSource: DataSource,
    ) {}

    /**
     * Obtiene el nombre del registro según el módulo y los datos
     * Para UPDATE/DELETE usa datos anteriores, para INSERT usa datos nuevos
     */
    private async obtenerNombreRegistro(modulo: string, idRegistro: number, datosAnteriores: string | null, datosNuevos: string, accion: string): Promise<string> {
        try {
            // Para Actualización y Eliminación, intentar obtener el nombre de los datos anteriores
            if ((accion === 'Actualización' || accion === 'Eliminación') && datosAnteriores) {
                try {
                    const anteriores = JSON.parse(datosAnteriores);
                    
                    // Buscar el campo de nombre según el módulo
                    switch (modulo.toLowerCase()) {
                        case 'categoria':
                            if (anteriores.Nombre_Categoria) return anteriores.Nombre_Categoria;
                            break;
                        case 'unidad de medicion':
                            if (anteriores.Nombre_Unidad) return anteriores.Nombre_Unidad;
                            break;
                        case 'material':
                            if (anteriores.Nombre_Material) return anteriores.Nombre_Material;
                            break;
                        case 'proveedor':
                            if (anteriores.Nombre_Proveedor) return anteriores.Nombre_Proveedor;
                            break;
                        case 'usuario':
                            if (anteriores.Nombre_Usuario) return anteriores.Nombre_Usuario;
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
                        case 'rol':
                            if (nuevos.Nombre_Rol) return nuevos.Nombre_Rol;
                            break;
                        case 'categoria':
                            if (nuevos.Nombre_Categoria) return nuevos.Nombre_Categoria;
                            break;
                        case 'unidad de medicion':
                            if (nuevos.Nombre_Unidad) return nuevos.Nombre_Unidad;
                            break;
                        case 'material':
                            if (nuevos.Nombre_Material) return nuevos.Nombre_Material;
                            break;
                        case 'proveedor':
                            if (nuevos.Nombre_Proveedor) return nuevos.Nombre_Proveedor;
                            break;
                        case 'proyecto':
                            if (nuevos.Titulo) return nuevos.Titulo;
                            break;
                        case 'acta':
                            if (nuevos.Titulo) return nuevos.Titulo;
                            break;

                        case 'calidad de agua':
                            if (nuevos.Titulo) return nuevos.Titulo;
                            break;
                    }
                } catch (error) {
                    console.error('Error al parsear datos nuevos:', error);
                }
            }

            // Si no se pudo obtener de los datos JSON, hacer query a la base de datos como fallback
            switch (modulo.toLowerCase()) {
                case 'categoria':
                    const categoria = await this.dataSource.getRepository(Categoria).findOne({
                        where: { Id_Categoria: idRegistro }
                    });
                    return categoria?.Nombre_Categoria || `Categoría ID: ${idRegistro}`;

                case 'unidad de medicion':
                case 'unidadmedicion':
                    const unidad = await this.dataSource.getRepository(UnidadMedicion).findOne({
                        where: { Id_Unidad_Medicion: idRegistro }
                    });
                    return unidad?.Nombre_Unidad || `Unidad ID: ${idRegistro}`;

                case 'material':
                    const material = await this.dataSource.getRepository(Material).findOne({
                        where: { Id_Material: idRegistro }
                    });
                    return material?.Nombre_Material || `Material ID: ${idRegistro}`;

                case 'proveedor':
                    const proveedor = await this.dataSource.getRepository(Proveedor).findOne({
                        where: { Id_Proveedor: idRegistro }
                    });
                    return proveedor?.Nombre_Proveedor || `Proveedor ID: ${idRegistro}`;

                case 'usuario':
                    const usuario = await this.usuarioRepository.findOne({
                        where: { Id_Usuario: idRegistro }
                    });
                    return usuario?.Nombre_Usuario || `Usuario ID: ${idRegistro}`;

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
                Nombre_Registro: nombreRegistro, // Nombre legible del registro
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