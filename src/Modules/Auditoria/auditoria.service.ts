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

    /**
     * Mapeo de nombres técnicos a nombres legibles para el frontend
     */
    private readonly camposLegibles: Record<string, string> = {
        // Categoría
        Nombre_Categoria: 'Nombre',
        Id_Estado_Categoria: 'Estado',
        Estado_Categoria: 'Estado',
        
        // Unidad de Medición
        Nombre_Unidad_Medicion: 'Nombre',
        Abreviatura: 'Abreviatura',
        Id_Estado_Unidad_Medicion: 'Estado',
        Estado_Unidad_Medicion: 'Estado',
        
        // Material
        Nombre_Material: 'Nombre',
        Descripcion: 'Descripción',
        Cantidad: 'Cantidad',
        Precio_Unitario: 'Precio Unitario',
        Id_Estado_Material: 'Estado',
        Estado_Material: 'Estado',
        Id_Unidad_Medicion: 'Unidad de Medición',
        Unidad_Medicion: 'Unidad de Medición',
        Categorias: 'Categorías',
        Id_Proveedor: 'Proveedor',
        Proveedor: 'Proveedor',
        
        // Proveedor
        Nombre_Proveedor: 'Nombre',
        Telefono_Proveedor: 'Teléfono',
        Tipo_Entidad: 'Tipo de Entidad',
        Tipo_Identificacion: 'Tipo de Identificación',
        Identificacion: 'Identificación',
        Cedula_Juridica: 'Cédula Jurídica',
        Razon_Social: 'Razón Social',
        Id_Estado_Proveedor: 'Estado',
        Estado_Proveedor: 'Estado',
        
        // Usuario
        Nombre_Usuario: 'Nombre',
        Correo: 'Correo',
        Id_Rol: 'Rol',
        Rol: 'Rol',
        
        // Genéricos
        Fecha_Creacion: 'Fecha de Creación',
        Fecha_Actualizacion: 'Fecha de Actualización',
    };

    /**
     * Obtiene un nombre legible para un campo
     */
    private obtenerNombreLegible(campo: string): string {
        return this.camposLegibles[campo] || campo.replace(/_/g, ' ');
    }

    /**
     * Extrae los campos modificados comparando datos anteriores y nuevos
     */
    private extraerCamposModificados(datosAnteriores: string | null, datosNuevos: string): string[] {
        try {
            const nuevos = datosNuevos ? JSON.parse(datosNuevos) : {};
            const anteriores = datosAnteriores ? JSON.parse(datosAnteriores) : {};

            // Si no hay datos anteriores (INSERT), devolver todos los campos nuevos
            if (!datosAnteriores || Object.keys(anteriores).length === 0) {
                return Object.keys(nuevos)
                    .filter(key => !key.startsWith('Id_') || key === 'Id_Estado_Categoria' || key === 'Id_Estado_Material' || key === 'Id_Estado_Unidad_Medicion' || key === 'Id_Estado_Proveedor')
                    .map(key => this.obtenerNombreLegible(key));
            }

            // Para UPDATE, comparar y encontrar campos modificados
            const camposModificados: string[] = [];
            
            for (const key in nuevos) {
                // Comparar valores
                if (JSON.stringify(anteriores[key]) !== JSON.stringify(nuevos[key])) {
                    camposModificados.push(this.obtenerNombreLegible(key));
                }
            }

            return camposModificados;
        } catch (error) {
            console.error('Error al extraer campos modificados:', error);
            return [];
        }
    }

    async getAuditorias() {
        const auditorias = await this.auditoriaRepository.createQueryBuilder('auditoria')
            .leftJoinAndSelect('auditoria.Usuario', 'usuario')
            .leftJoinAndSelect('usuario.Rol', 'rol')
            .orderBy('auditoria.Fecha_Accion', 'DESC')
            .getMany();

        return auditorias.map(auditoria => {
            const camposModificados = this.extraerCamposModificados(
                auditoria.Datos_Anteriores,
                auditoria.Datos_Nuevos
            );

            return {
                Id_Auditoria: auditoria.Id_Auditoria,
                Modulo: auditoria.Modulo,
                Accion: auditoria.Accion,
                Id_Registro: auditoria.Id_Registro,
                Campos_Modificados: camposModificados, // Array de nombres legibles
                Campos_Modificados_Texto: camposModificados.join(', '), // Texto concatenado
                Fecha_Accion: auditoria.Fecha_Accion,
                Usuario: auditoria.Usuario ? {
                    Id_Usuario: auditoria.Usuario.Id_Usuario,
                    Nombre_Usuario: auditoria.Usuario.Nombre_Usuario,
                    Id_Rol: auditoria.Usuario.Id_Rol,
                    Nombre_Rol: auditoria.Usuario.Rol?.Nombre_Rol
                } : null,
                // Opcional: incluir los datos completos si se necesitan
                Datos_Anteriores: auditoria.Datos_Anteriores,
                Datos_Nuevos: auditoria.Datos_Nuevos
            };
        });
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