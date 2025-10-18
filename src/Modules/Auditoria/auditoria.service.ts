import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Usuario } from "../Usuarios/UsuarioEntities/Usuario.Entity";
import { Auditoria } from "./AuditoriaEntities/Auditoria.Entities";
import { Categoria } from "../Inventario/InventarioEntities/Categoria.Entity";
import { UnidadMedicion } from "../Inventario/InventarioEntities/UnidadMedicion.Entity";
import { Material } from "../Inventario/InventarioEntities/Material.Entity";
import { Proveedor } from "../Proveedores/ProveedorEntities/Proveedor.Entity";
import { Acta } from "../Actas/ActaEntities/Acta.Entity";
import { CalidadAgua } from "../CalidadAgua/CalidadAguaEntities/CalidadAgua.Entity";
import { UsuariosService } from "../Usuarios/Services/usuarios.service";

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(Auditoria)
        private readonly auditoriaRepository: Repository<Auditoria>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        private readonly dataSource: DataSource,

        private readonly usuariosService: UsuariosService,
    ) {}

    /*
        Obtiene el nombre del registro según el módulo y los datos
        Para UPDATE/DELETE usa datos anteriores, para INSERT usa datos nuevos
     */
    private async obtenerNombreRegistro(modulo: string, idRegistro: number, datosAnteriores: string | null, datosNuevos: string, accion: string): Promise<string> {
        try {
            // Para UPDATE y DELETE, intentar obtener el nombre de los datos anteriores
            if ((accion === 'Update' || accion === 'Delete') && datosAnteriores) {
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
                        case 'calidad de agua':
                            if (anteriores.Titulo) return anteriores.Titulo;
                            break;
                    }
                } catch (error) {
                    console.error('Error al parsear datos anteriores:', error);
                }
            }

            // Para INSERT, intentar obtener el nombre de los datos nuevos
            if (accion === 'Insert' && datosNuevos) {
                try {
                    const nuevos = JSON.parse(datosNuevos);
                    switch (modulo.toLowerCase()) {
                        case 'usuarios':
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
                case 'categorias':
                    const categoria = await this.dataSource.getRepository(Categoria).findOne({
                        where: { Id_Categoria: idRegistro }
                    });
                    return categoria?.Nombre_Categoria || `Categoría ID: ${idRegistro}`;

                case 'unidades de medicion':
                    const unidad = await this.dataSource.getRepository(UnidadMedicion).findOne({
                        where: { Id_Unidad_Medicion: idRegistro }
                    });
                    return unidad?.Nombre_Unidad || `Unidad ID: ${idRegistro}`;

                case 'materiales':
                    const material = await this.dataSource.getRepository(Material).findOne({
                        where: { Id_Material: idRegistro }
                    });
                    return material?.Nombre_Material || `Material ID: ${idRegistro}`;

                case 'proveedores':
                    const proveedor = await this.dataSource.getRepository(Proveedor).findOne({
                        where: { Id_Proveedor: idRegistro }
                    });
                    return proveedor?.Nombre_Proveedor || `Proveedor ID: ${idRegistro}`;

                case 'usuarios':
                    const usuario = await this.usuarioRepository.findOne({
                        where: { Id_Usuario: idRegistro }
                    });
                    return usuario?.Nombre_Usuario || `Usuario ID: ${idRegistro}`;

                case 'actas':
                    const acta = await this.dataSource.getRepository(Acta).findOne({
                        where: { Id_Acta: idRegistro }
                    });
                    return acta?.Titulo || `Acta ID: ${idRegistro}`;

                case 'calidad de agua':
                    const calidadAgua = await this.dataSource.getRepository(CalidadAgua).findOne({
                        where: { Id_Calidad_Agua: idRegistro }
                    });
                    return calidadAgua?.Titulo || `Calidad de Agua ID: ${idRegistro}`;

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
                Nombre_Registro: nombreRegistro,
                Fecha_Accion: auditoria.Fecha_Accion,
                Usuario: auditoria.Usuario ?
                    await this.usuariosService.FormatearUsuarioResponse(auditoria.Usuario) : null,
                // Datos completos en JSON
                Datos_Anteriores: auditoria.Datos_Anteriores,
                Datos_Nuevos: auditoria.Datos_Nuevos
            };
        }));
    }

    async createAuditoria(modulo: string, accion: string, usuarioId: number, idRegistro: number, datosAnteriores?: any, datosNuevos?: any): Promise<Auditoria> {
        if (!modulo || modulo.trim() === '') throw new BadRequestException('Debe proporcionar un nombre de módulo válido');
        if (!accion || accion.trim() === '') throw new BadRequestException('Debe proporcionar una acción válida');
        if (!usuarioId || usuarioId <= 0) throw new BadRequestException('Debe proporcionar un ID de usuario válido');
        if (!idRegistro || idRegistro <= 0) throw new BadRequestException('Debe proporcionar un ID de registro válido');

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: usuarioId } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

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
    async getAuditoriasPorModulo(modulo: string): Promise<any[]> {
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

    async getAuditoriasPorUsuario(usuarioId: number): Promise<any[]> {
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

    async getAuditoriasPorRegistro(modulo: string, idRegistro: number): Promise<any[]> {
        if (!modulo || modulo.trim() === '') throw new BadRequestException('Debe proporcionar un nombre de módulo válido');
        if (!idRegistro || idRegistro <= 0) throw new BadRequestException('Debe proporcionar un ID de registro válido');
        
        const auditorias = await this.auditoriaRepository.find({ 
            where: { Modulo: modulo, Id_Registro: idRegistro }, 
            relations: ['Usuario', 'Usuario.Rol'], 
            order: { Fecha_Accion: 'DESC' } 
        });

        return Promise.all(auditorias.map(async (auditoria) => ({
            ...auditoria,
            Usuario: auditoria.Usuario ?
                await this.usuariosService.FormatearUsuarioResponse(auditoria.Usuario) : null
        })));
    }
}