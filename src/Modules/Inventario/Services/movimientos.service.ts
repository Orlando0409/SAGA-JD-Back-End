import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EstadoMaterial } from "../InventarioEntities/EstadoMaterial.Entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { MovimientoMaterialDto } from "../InventarioDTO's/MovimientoMaterial.dto";
import { Material } from "../InventarioEntities/Material.Entity";
import { MovimientoInventario } from "../InventarioEntities/Movimiento.Entity";
import { Usuario } from "src/Modules/Usuarios/UsuarioEntities/Usuario.Entity";

@Injectable()
export class MovimientosService {
    constructor(
        @InjectRepository(MovimientoInventario)
        private readonly movimientoRepository: Repository<MovimientoInventario>,

        @InjectRepository(Material)
        private readonly materialRepository: Repository<Material>,

        @InjectRepository(EstadoMaterial)
        private readonly estadoMaterialRepository: Repository<EstadoMaterial>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async getAllMovimientos() {
        const movimientos = await this.movimientoRepository.createQueryBuilder('movimiento')
            .leftJoinAndSelect('movimiento.Material', 'material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .leftJoinAndSelect('movimiento.Usuario_Creador', 'usuarioCreador')
            .orderBy('movimiento.Fecha_Movimiento', 'DESC')
            .getMany();

        return movimientos.map(movimiento => {
            return {
                Id_Ingreso_Egreso: movimiento.Id_Movimiento,
                Tipo_Movimiento: movimiento.Tipo_Movimiento,
                Cantidad: movimiento.Cantidad,
                Cantidad_Anterior: movimiento.Cantidad_Anterior,
                Cantidad_Nueva: movimiento.Cantidad_Nueva,
                Observaciones: movimiento.Observaciones,
                Fecha_Movimiento: movimiento.Fecha_Movimiento,
                Material: {
                    Id_Material: movimiento.Material.Id_Material,
                    Nombre_Material: movimiento.Material.Nombre_Material,
                    Cantidad: movimiento.Material.Cantidad,
                    Estado_Material: movimiento.Material.Estado_Material
                },
                Usuario_Creador: movimiento.Usuario_Creador ? {
                    Id_Usuario: movimiento.Usuario_Creador.Id_Usuario,
                    Nombre_Usuario: movimiento.Usuario_Creador.Nombre_Usuario,
                    Id_Rol: movimiento.Usuario_Creador.Id_Rol
                } : null
            };
        });
    }

    async IngresoMaterial(dto: MovimientoMaterialDto, idUsuarioCreador: number) {
        if (dto.Cantidad <= 0) { throw new BadRequestException('La cantidad a ingresar debe ser mayor que cero'); }

        const materialExistente = await this.materialRepository.findOne({ where: { Id_Material: dto.Id_Material } });
        if (!materialExistente) { throw new NotFoundException('Material no encontrado'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuarioCreador }, relations: ['Rol'] });
        if (!usuario) { throw new NotFoundException('Usuario no encontrado'); }

        // Guardar cantidad anterior para el registro
        const cantidadAnterior = materialExistente.Cantidad;

        materialExistente.Cantidad += dto.Cantidad;
        if(materialExistente.Cantidad > 0 && materialExistente.Estado_Material.Id_Estado_Material === 4) {
            const estadoActivo = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 3 } });
            if(estadoActivo) {
                materialExistente.Estado_Material = estadoActivo;
            }
        }

        if (materialExistente.Cantidad > 0 && materialExistente.Estado_Material.Id_Estado_Material === 2) {
            const estadoActivo = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 1 } });
            if (estadoActivo) {
                materialExistente.Estado_Material = estadoActivo;
            }
        }

        await this.materialRepository.save(materialExistente);

        // Registrar el movimiento en la tabla Movimientos
        const movimiento = this.movimientoRepository.create({
            Tipo_Movimiento: 'Entrada',
            Material: materialExistente,
            Cantidad: dto.Cantidad,
            Observaciones: dto.Observaciones,
            Cantidad_Anterior: cantidadAnterior,
            Cantidad_Nueva: materialExistente.Cantidad,
            Usuario_Creador: usuario
        });
        
        await this.movimientoRepository.save(movimiento);

        const materialActualizado = await this.materialRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .where('material.Id_Material = :id', { id: dto.Id_Material })
            .getOne();

        // Obtener el último movimiento creado
        const ultimoMovimiento = await this.movimientoRepository.createQueryBuilder('movimiento')
            .leftJoinAndSelect('movimiento.Usuario_Creador', 'usuarioCreador')
            .where('movimiento.Material.Id_Material = :id', { id: dto.Id_Material })
            .orderBy('movimiento.Fecha_Movimiento', 'DESC')
            .getOne();

        if (!ultimoMovimiento) {
            throw new NotFoundException('No se pudo encontrar el movimiento registrado.');
        }

        return {
            Material: materialActualizado,
            Movimiento: {
                Id_Ingreso_Egreso: ultimoMovimiento.Id_Movimiento,
                Tipo_Movimiento: ultimoMovimiento.Tipo_Movimiento,
                Cantidad: ultimoMovimiento.Cantidad,
                Cantidad_Anterior: ultimoMovimiento.Cantidad_Anterior,
                Cantidad_Nueva: ultimoMovimiento.Cantidad_Nueva,
                Observaciones: ultimoMovimiento.Observaciones,
                Fecha_Movimiento: ultimoMovimiento.Fecha_Movimiento,
                Usuario_Creador: {
                    Id_Usuario: usuario.Id_Usuario,
                    Nombre_Usuario: usuario.Nombre_Usuario,
                    Id_Rol: usuario.Id_Rol,
                    Nombre_Rol: usuario.Rol?.Nombre_Rol
                }
            }
        };
    }

    async EgresoMaterial(Id_Usuario: number, dto: MovimientoMaterialDto) {
        if (dto.Cantidad <= 0) { throw new BadRequestException('La cantidad a egresar debe ser mayor que cero'); }

        const materialExistente = await this.materialRepository.findOne({ where: { Id_Material: dto.Id_Material } });
        if (!materialExistente) { throw new NotFoundException('Material no encontrado'); }

        const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: Id_Usuario }, relations: ['Rol'] });
        if (!usuario) { throw new NotFoundException('Usuario no encontrado'); }

        if (materialExistente.Cantidad < dto.Cantidad) { throw new BadRequestException('No hay suficiente cantidad en inventario para realizar el egreso'); }

        // Guardar cantidad anterior para el registro
        const cantidadAnterior = materialExistente.Cantidad;

        materialExistente.Cantidad -= dto.Cantidad;
        if(materialExistente.Cantidad === 0 && materialExistente.Estado_Material.Id_Estado_Material === 3) {
            const estadoInactivo = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 4 } });
            if(estadoInactivo) {
                materialExistente.Estado_Material = estadoInactivo;
            }
        }

        if (materialExistente.Cantidad === 0 && materialExistente.Estado_Material.Id_Estado_Material === 1) {
            const estadoInactivo = await this.estadoMaterialRepository.findOne({ where: { Id_Estado_Material: 2 } });
            if (estadoInactivo) {
                materialExistente.Estado_Material = estadoInactivo;
            }
        }

        await this.materialRepository.save(materialExistente);

        // Registrar el movimiento en la tabla Movimientos
        const movimiento = this.movimientoRepository.create({
            Material: materialExistente,
            Usuario_Creador: usuario,
            Tipo_Movimiento: 'Salida',
            Cantidad: dto.Cantidad,
            Cantidad_Anterior: cantidadAnterior,
            Cantidad_Nueva: materialExistente.Cantidad,
            Observaciones: dto.Observaciones
        });

        await this.movimientoRepository.save(movimiento);

        const materialActualizado = await this.materialRepository.createQueryBuilder('material')
            .leftJoinAndSelect('material.Estado_Material', 'estadoMaterial')
            .where('material.Id_Material = :id', { id: dto.Id_Material })
            .getOne();

        // Obtener el último movimiento creado
        const ultimoMovimiento = await this.movimientoRepository.createQueryBuilder('movimiento')
            .leftJoinAndSelect('movimiento.Usuario_Creador', 'usuarioCreador')
            .where('movimiento.Material.Id_Material = :id', { id: dto.Id_Material })
            .orderBy('movimiento.Fecha_Movimiento', 'DESC')
            .getOne();

        return {
            Material: materialActualizado,
            Movimiento: ultimoMovimiento ? {
                Id_Ingreso_Egreso: ultimoMovimiento.Id_Movimiento,
                Tipo_Movimiento: ultimoMovimiento.Tipo_Movimiento,
                Cantidad: ultimoMovimiento.Cantidad,
                Cantidad_Anterior: ultimoMovimiento.Cantidad_Anterior,
                Cantidad_Nueva: ultimoMovimiento.Cantidad_Nueva,
                Observaciones: ultimoMovimiento.Observaciones,
                Fecha_Movimiento: ultimoMovimiento.Fecha_Movimiento,
                Usuario_Creador: ultimoMovimiento.Usuario_Creador ? {
                    Id_Usuario: usuario.Id_Usuario,
                    Nombre_Usuario: usuario.Nombre_Usuario,
                    Id_Rol: usuario.Id_Rol,
                    Nombre_Rol: usuario.Rol?.Nombre_Rol
                } : null
            } : null
        };
    }
}