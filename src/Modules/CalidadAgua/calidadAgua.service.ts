import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CalidadAgua } from "./CalidadAguaEntities/CalidadAgua.Entity";
import { CreateCalidadAguaDto } from "./CalidadAguaDTO's/CreateCalidadAgua.dto";
import { UpdateCalidadAguaDto } from "./CalidadAguaDTO's/UpdateCalidadAgua.dto";

@Injectable()
export class CalidadAguaService
{
    constructor
    (
        @InjectRepository(CalidadAgua)
        private readonly calidadAguaRepository: Repository<CalidadAgua>
    ) {}

    async getCalidadAgua()
    {
        return this.calidadAguaRepository.find
    }

    async getCalidadAguaById(Id_Calidad_Agua: number)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua }})
        if(!CalidadAgua) { throw new NotFoundException(`Archivo con id ${Id_Calidad_Agua} no encontrado`); }
        return CalidadAgua;
    }

    async CreateCalidadAgua(dto: CreateCalidadAguaDto)
    {
        const nuevoCalidadAgua = this.calidadAguaRepository.create(dto);
        return this.calidadAguaRepository.save(nuevoCalidadAgua);
    }

    async UpdateCalidadAgua(Id_Calidad_Agua: number, dto: UpdateCalidadAguaDto)
    {
        const CalidadAgua = await this.calidadAguaRepository.findOne({ where: { Id_Calidad_Agua } });
        if(!CalidadAgua)
        {
            throw new NotFoundException(`Archivo de calidad de agua con id ${Id_Calidad_Agua} no encontrado`);
        }

        Object.assign(CalidadAgua, dto);
        return this.calidadAguaRepository.save(CalidadAgua);
    }
}