import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedicion } from '../InventarioEntities/UnidadMedicion.Entity';
import { EstadoUnidadMedicion } from '../InventarioEntities/EstadoUnidadMedicion.Entity';
import { CreateUnidadMedicionDto } from "../InventarioDTO's/CreateUnidadMedicion.dto";
import { UpdateUnidadMedicionDto } from "../InventarioDTO's/UpdateUnidadMedicion.dto";
import { getUnidadDeMedidaDTO } from "../InventarioDTO's/getUidadaDeMedida.dto";

@Injectable()
export class UnidadesDeMedicionService {
    constructor(
        @InjectRepository(UnidadMedicion)
        private readonly unidadMedicionRepository: Repository<UnidadMedicion>,

        @InjectRepository(EstadoUnidadMedicion)
        private readonly estadoUnidadMedicionRepository: Repository<EstadoUnidadMedicion>,
    ) {}

    async getAllUnidadesMedicion() {
        return this.unidadMedicionRepository.find({ relations: ['Estado_Unidad_Medicion'] });
    }

    async getUnidadMedicionSimple(): Promise<getUnidadDeMedidaDTO[]> {
        const unidades = await this.unidadMedicionRepository.find({ select: ['Id_Unidad_Medicion', 'Nombre_Unidad'] });
        return unidades.map(unidad => {
            const dto = new getUnidadDeMedidaDTO();
            dto.Id_Unidad_Medicion = unidad.Id_Unidad_Medicion;
            dto.Nombre_Unidad_Medicion = unidad.Nombre_Unidad[0].toUpperCase() + unidad.Nombre_Unidad.slice(1).toLowerCase();
            return dto;
        });
    }

    async createUnidadMedicion(dto: CreateUnidadMedicionDto) {
        const nombreNormalizado = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();
        const abreviaturaToLowerCase = dto.Abreviatura.toLowerCase();

        // Verificar que no exista una unidad con el mismo nombre
        const unidadExistentePorNombre = await this.unidadMedicionRepository.findOne({ 
            where: { Nombre_Unidad: nombreNormalizado } 
        });
        if (unidadExistentePorNombre) {
            throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreNormalizado}"`);
        }

        // Verificar que no exista una unidad con la misma abreviatura
        const unidadExistentePorAbrev = await this.unidadMedicionRepository.findOne({ 
            where: { Abreviatura: abreviaturaToLowerCase } 
        });
        if (unidadExistentePorAbrev) {
            throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToLowerCase}"`);
        }

        const unidad = this.unidadMedicionRepository.create({
            Nombre_Unidad: nombreNormalizado,
            Abreviatura: abreviaturaToLowerCase,
            Descripcion: dto.Descripcion,
        });

        await this.unidadMedicionRepository.save(unidad);
        return this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: unidad.Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
    }

    async updateUnidadMedicion(Id_Unidad_Medicion: number, dto: UpdateUnidadMedicionDto) {
        const unidadExistente = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion } });
        if (!unidadExistente) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Validar nombre único si se está actualizando
        if (dto.Nombre_Unidad_Medicion && (dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase()) !== unidadExistente.Nombre_Unidad) {
            const nombreNormalizado = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();

            const unidadConNombre = await this.unidadMedicionRepository.findOne({ where: { Nombre_Unidad: nombreNormalizado } });
            if (unidadConNombre) { throw new ConflictException(`Ya existe una unidad de medición con el nombre "${nombreNormalizado}"`); }
        }

        // Validar abreviatura única si se está actualizando
        if (dto.Abreviatura && dto.Abreviatura.toLowerCase() !== unidadExistente.Abreviatura) {
            const abreviaturaToLowerCase = dto.Abreviatura.toLowerCase();

            const unidadConAbrev = await this.unidadMedicionRepository.findOne({ where: { Abreviatura: abreviaturaToLowerCase } });
            if (unidadConAbrev) { throw new ConflictException(`Ya existe una unidad de medición con la abreviatura "${abreviaturaToLowerCase}"`); }
        }

        const unidadActualizada = {
            ...unidadExistente,
            ...dto,
        };

        if (dto.Nombre_Unidad_Medicion) {
            unidadActualizada.Nombre_Unidad = dto.Nombre_Unidad_Medicion[0].toUpperCase() + dto.Nombre_Unidad_Medicion.slice(1).toLowerCase();
        }
        if (dto.Abreviatura) {
            unidadActualizada.Abreviatura = dto.Abreviatura.toLowerCase();
        }

        return this.unidadMedicionRepository.save(unidadActualizada);
    }

    async updateEstadoUnidadMedicion(Id_Unidad_Medicion: number, Id_Estado_Unidad_Medicion: number) {
        const unidad = await this.unidadMedicionRepository.findOne({ 
            where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, 
            relations: ['Estado_Unidad_Medicion'] 
        });
        if (!unidad) { 
            throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); 
        }

        // Verificar que el nuevo estado existe
        const nuevoEstado = await this.estadoUnidadMedicionRepository.findOne({ 
            where: { Id_Estado_Unidad_Medicion: Id_Estado_Unidad_Medicion } 
        });
        if (!nuevoEstado) { 
            throw new NotFoundException(`Estado con ID ${Id_Estado_Unidad_Medicion} no encontrado en la base de datos`); 
        }

        // Actualizar el estado de la unidad
        unidad.Estado_Unidad_Medicion = nuevoEstado;
        await this.unidadMedicionRepository.save(unidad);
        return this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Estado_Unidad_Medicion'] });
    }

    async deleteUnidadMedicion(Id_Unidad_Medicion: number) {
        const unidad = await this.unidadMedicionRepository.findOne({ where: { Id_Unidad_Medicion: Id_Unidad_Medicion }, relations: ['Materiales'] });
        if (!unidad) { throw new NotFoundException(`Unidad de medición con ID ${Id_Unidad_Medicion} no encontrada`); }

        // Verificar si hay materiales usando esta unidad
        if (unidad.Materiales && unidad.Materiales.length > 0) { throw new BadRequestException(`No se puede eliminar la unidad de medición porque ${unidad.Materiales.length} material(es) la están usando`); }

        await this.unidadMedicionRepository.remove(unidad);
        return { message: `Unidad de medición "${unidad.Nombre_Unidad}" eliminada exitosamente` };
    }
}
