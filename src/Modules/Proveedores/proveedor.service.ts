import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from './ProveedorEntities/Proveedor.Entity';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor.dto';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor.dto';
import { EstadoProveedor } from './ProveedorEntities/EstadoProveedor.Entity';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor.dto';
import { TipoProveedor } from './ProveedorEntities/TipoProveedor.Entity';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedorRepo: Repository<Proveedor>,

    @InjectRepository(ProveedorFisico)
    private fisicoRepo: Repository<ProveedorFisico>,

    @InjectRepository(ProveedorJuridico)
    private juridicoRepo: Repository<ProveedorJuridico>,

    @InjectRepository(EstadoProveedor)
    private estadoRepo: Repository<EstadoProveedor>,
  ) {}

    async createFisico(dto: CreateProveedorFisicoDto): Promise<ProveedorFisico> {
      const nombreExistente = await this.fisicoRepo.findOne({
        where: { Nombre_Proveedor: dto.Nombre_Proveedor },
    });
      if (nombreExistente) {
        throw new ConflictException('Este nombre ya se encuentra registrado');
    }

    const IdentificacionExistente = await this.fisicoRepo.findOne({
      where: { Identificacion: dto.Identificacion },
    });
      if (IdentificacionExistente) {
        throw new ConflictException('Esta identificación ya se encuentra registrada');
    }

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
      if (!estado) {
        throw new NotFoundException('El estado seleccionado no es válido');
    }

    const proveedor = this.proveedorRepo.create({
      ...dto,
      Tipo_Proveedor: { Id_Tipo_Proveedor: 1 } as any, // Físico
      Estado_Proveedor: estado
    });
      await this.proveedorRepo.save(proveedor);

    const proveedorFisico = this.fisicoRepo.create({
      ...dto,
      Tipo_Proveedor: { Tipo_Proveedor: 'Fisico' } as any,
      Estado_Proveedor: estado
    });

    return this.fisicoRepo.save(proveedorFisico);
  }

  async createJuridico(dto: CreateProveedorJuridicoDto): Promise<ProveedorJuridico> {
    const nombreExistente = await this.juridicoRepo.findOne({
      where: { Nombre_Proveedor: dto.Nombre_Proveedor },
    });
      if (nombreExistente) {
        throw new ConflictException('Este nombre ya se encuentra registrado');
    }

    const cedulaExistente = await this.juridicoRepo.findOne({
      where: { Cedula_Juridica: (dto.Cedula_Juridica) },
    });
      if (cedulaExistente) {
        throw new ConflictException('Esta identificación ya se encuentra registrada');
    }

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
      if (!estado) {
        throw new NotFoundException('El estado seleccionado no es válido');
    }

    const proveedor = this.proveedorRepo.create({
      ...dto,
      Tipo_Proveedor: { Id_Tipo_Proveedor: 2 } as any, // Jurídico
      Estado_Proveedor: estado
    });
      await this.proveedorRepo.save(proveedor);

    const proveedorJuridico = this.juridicoRepo.create({
      ...dto,
      Tipo_Proveedor: { Tipo_Proveedor: 'Juridico' } as any,
      Estado_Proveedor: estado
    });
    return this.juridicoRepo.save(proveedorJuridico);
  }

    findAllFisico(): Promise<ProveedorFisico[]> {
      return this.fisicoRepo.find({ relations: ['Estado_Proveedor', 'Tipo_Proveedor'] });
    }

    findAllJuridico(): Promise<ProveedorJuridico[]> {
      return this.juridicoRepo.find({ relations: ['Estado_Proveedor', 'Tipo_Proveedor'] });
    }

    async findOneFisico(id: number): Promise<ProveedorFisico> {
      const proveedor = await this.fisicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['Estado_Proveedor', 'Tipo_Proveedor'] });
        if (!proveedor) throw new NotFoundException(`Proveedor Físico ${id} no encontrado`);
      return proveedor;
    }

    async findOneJuridico(id: number): Promise<ProveedorJuridico> {
      const proveedor = await this.juridicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['Estado_Proveedor', 'Tipo_Proveedor'] });
        if (!proveedor) throw new NotFoundException(`Proveedor Jurídico ${id} no encontrado`);
      return proveedor;
    }

    async updateFisico(id: number, dto: UpdateProveedorFisicoDto): Promise<ProveedorFisico> {
      const proveedor = await this.findOneFisico(id);
      
      // Excluir explícitamente tipo_identificacion de la actualización
      const { Tipo_Identificacion, ...updateData } = dto as any;
      
      Object.assign(proveedor, updateData);
      return this.fisicoRepo.save(proveedor);
    }

    async updateJuridico(id: number, dto: UpdateProveedorJuridicoDto): Promise<ProveedorJuridico> {
      const proveedor = await this.findOneJuridico(id);
        Object.assign(proveedor, dto);
      return this.juridicoRepo.save(proveedor);
    }

    //----Actualizar Estado---- 
      async updateEstadoFisico(id: number, dto: UpdateEstadoProveedorDto): Promise<ProveedorFisico> {
      const proveedor = await this.findOneFisico(id);

      const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
      if (!estado) throw new NotFoundException(`Estado proveedor ${dto.Id_Estado_Proveedor} no encontrado`);

      proveedor.Estado_Proveedor = estado;
      return this.fisicoRepo.save(proveedor);
    }

    async updateEstadoJuridico(id: number, dto: UpdateEstadoProveedorDto): Promise<ProveedorJuridico> {
      const proveedor = await this.findOneJuridico(id);

      const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
      if (!estado) throw new NotFoundException(`Estado proveedor ${dto.Id_Estado_Proveedor} no encontrado`);

      proveedor.Estado_Proveedor = estado;
      return this.juridicoRepo.save(proveedor);
    }

    async removeFisico(id: number): Promise<void> {
      const proveedor = await this.findOneFisico(id);
      await this.fisicoRepo.remove(proveedor);
    }

    async removeJuridico(id: number): Promise<void> {
      const proveedor = await this.findOneJuridico(id);
      await this.juridicoRepo.remove(proveedor);
    }
}