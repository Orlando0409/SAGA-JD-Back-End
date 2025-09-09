import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Abonado } from '../AfiliadoEntities/Abonado.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';
import { SolicitudAfiliacionFisica } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { CreateAbonadoDto } from '../AfiliadoDTO\'s/CreateAbonado.dto';
import { UpdateAbonadoDto } from '../AfiliadoDTO\'s/UpdateAbonado.dto';

@Injectable()
export class AbonadosService {
  constructor(
    @InjectRepository(Abonado)
    private readonly abonadoRepository: Repository<Abonado>,

    @InjectRepository(EstadoAfiliado)
    private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

    @InjectRepository(SolicitudAfiliacionFisica)
    private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,
  ) {}

  async getAllAbonados() {
    return this.abonadoRepository.find({ relations: ['Estado'] });
  }

  async getAbonadoById(id: number) {
    const abonado = await this.abonadoRepository.findOne({
      where: { Id_Abonado: id },
      relations: ['Estado']
    });
    if (!abonado) {
      throw new BadRequestException(`Abonado con id ${id} no encontrado`);
    }
    return abonado;
  }

  async getAbonadoByCedula(cedula: string) {
    const abonado = await this.abonadoRepository.findOne({
      where: { Cedula: cedula },
      relations: ['Estado']
    });

    if (!abonado) {
      throw new BadRequestException(`Abonado con cédula ${cedula} no encontrado`);
    }

    else
      return abonado;
  }

  async createAbonado(dto: CreateAbonadoDto) {
    // Verificar si ya existe un abonado con esa cédula
    const existingAbonado = await this.getAbonadoByCedula(dto.Cedula);
    if (existingAbonado) {
      throw new BadRequestException(`Ya existe un abonado con la cédula ${dto.Cedula}`);
    }

    // Verificar que existe una solicitud de afiliación aprobada para esta cédula
    const solicitudAprobada = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Cedula: dto.Cedula, Estado: { Id_Estado_Solicitud: 3 } }, relations: ['Estado'] });
    if (!solicitudAprobada) { throw new BadRequestException(`No existe una solicitud de afiliación aprobada para la cédula ${dto.Cedula}`); }

    // Obtener estado inicial (asumiendo que 1 es "Activo")
    const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
    if (!estadoInicial) { throw new BadRequestException('Estado inicial de abonado no configurado'); }

    const abonado = this.abonadoRepository.create({
      ...dto,
      Estado: estadoInicial
    });

    return this.abonadoRepository.save(abonado);
  }

// Método específico para crear abonado desde solicitud aprobada
  async createAbonadoFromSolicitud(solicitudData: any) {
    const createDto: CreateAbonadoDto = {
      Cedula: solicitudData.Cedula,
      Nombre: solicitudData.Nombre,
      Apellido1: solicitudData.Apellido1,
      Apellido2: solicitudData.Apellido2,
      Correo: solicitudData.Correo,
      Numero_Telefono: solicitudData.Numero_Telefono,
      Direccion_Exacta: solicitudData.Direccion_Exacta,
      Edad: solicitudData.Edad,
      Planos_Terreno: solicitudData.Planos_Terreno,
      Escritura_Terreno: solicitudData.Escritura_Terreno,
    };

    return this.createAbonado(createDto);
  }

  async updateAbonado(id: number, dto: UpdateAbonadoDto) {
    const abonado = await this.getAbonadoById(id);
    Object.assign(abonado, dto);
    return this.abonadoRepository.save(abonado);
  }

  async updateEstadoAbonado(id: number, nuevoEstadoId: number) {
    const abonado = await this.getAbonadoById(id);
    
    const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId }});
    if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

    abonado.Estado = nuevoEstado;
    return this.abonadoRepository.save(abonado);
  }

  async deleteAbonado(id: number) {
    const abonado = await this.getAbonadoById(id);
    return this.abonadoRepository.remove(abonado);
  }
}
