import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorFisico, ProveedorJuridico } from './ProveedorEntities/ProveedorEntity';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor';
import { EstadoProveedor } from './ProveedorEntities/EstadoProveedor';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor';

@Injectable()
export class ProveedorService {
  constructor(
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

  const cedulaExistente = await this.fisicoRepo.findOne({
    where: { Cedula_Fisica: dto.Cedula_Fisica },
  });
  if (cedulaExistente) {
    throw new ConflictException('Esta cédula ya se encuentra registrada');
  }

  const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
  if (!estado) {
    throw new NotFoundException('El estado seleccionado no es válido');
  }

  const proveedor = this.fisicoRepo.create({ ...dto, Estado_Proveedor: estado });
  return this.fisicoRepo.save(proveedor);
}


 async createJuridico(dto: CreateProveedorJuridicoDto): Promise<ProveedorJuridico> {

  const nombreExistente = await this.juridicoRepo.findOne({
    where: { Nombre_Proveedor: dto.Nombre_Proveedor },
  });
  if (nombreExistente) {
    throw new ConflictException('Este nombre ya se encuentra registrado');
  }


  const cedulaExistente = await this.juridicoRepo.findOne({
    where: { Cedula_Juridica: dto.Cedula_Juridica },
  });
  if (cedulaExistente) {
    throw new ConflictException('Esta cédula ya se encuentra registrada');
  }


  const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
  if (!estado) {
    throw new NotFoundException('El estado seleccionado no es válido');
  }

  const proveedor = this.juridicoRepo.create({ ...dto, Estado_Proveedor: estado });
  return this.juridicoRepo.save(proveedor);
}


  findAllFisico(): Promise<ProveedorFisico[]> {
    return this.fisicoRepo.find({ relations: ['estadoProveedor'] });
  }

  findAllJuridico(): Promise<ProveedorJuridico[]> {
    return this.juridicoRepo.find({ relations: ['estadoProveedor'] });
  }

  async findOneFisico(id: number): Promise<ProveedorFisico> {
    const proveedor = await this.fisicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['estadoProveedor'] });
    if (!proveedor) throw new NotFoundException(`Proveedor Físico ${id} no encontrado`);
    return proveedor;
  }

  async findOneJuridico(id: number): Promise<ProveedorJuridico> {
    const proveedor = await this.juridicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['estadoProveedor'] });
    if (!proveedor) throw new NotFoundException(`Proveedor Jurídico ${id} no encontrado`);
    return proveedor;
  }

  async updateFisico(id: number, dto: UpdateProveedorFisicoDto): Promise<ProveedorFisico> {
    const proveedor = await this.findOneFisico(id);
    Object.assign(proveedor, dto);
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
