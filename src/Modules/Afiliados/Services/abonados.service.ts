import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbonadoFisico, AbonadoJuridico } from '../AfiliadoEntities/Abonado.Entity';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';
import { SolicitudAfiliacionFisica, SolicitudAfiliacionJuridica } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { UpdateAbonadoFisicoDto, UpdateAbonadoJuridicoDto } from '../AfiliadoDTO\'s/UpdateAbonado.dto';

@Injectable()
export class AbonadosService {
  constructor(
    @InjectRepository(AbonadoFisico)
    private readonly abonadoFisicoRepository: Repository<AbonadoFisico>,

    @InjectRepository(AbonadoJuridico)
    private readonly abonadoJuridicoRepository: Repository<AbonadoJuridico>,

    @InjectRepository(EstadoAfiliado)
    private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

    @InjectRepository(SolicitudAfiliacionFisica)
    private readonly solicitudAfiliacionFisicaRepository: Repository<SolicitudAfiliacionFisica>,

    @InjectRepository(SolicitudAfiliacionJuridica)
    private readonly solicitudAfiliacionJuridicaRepository: Repository<SolicitudAfiliacionJuridica>
  ) {}

  async getAllAbonados() {
    return {
      fisicos: await this.abonadoFisicoRepository.find({ relations: ['Estado'] }),
      juridicos: await this.abonadoJuridicoRepository.find({ relations: ['Estado'] }),
    };
  }

  async getAbonadosFisicos() {
    return this.abonadoFisicoRepository.find({ relations: ['Estado'] });
  }

  async getAbonadosJuridicos() {
    return this.abonadoJuridicoRepository.find({ relations: ['Estado'] });
  }

  async getAbonadoFisicoById(id: number) {
    const abonado = await this.abonadoFisicoRepository.findOne({
      where: { Id_Abonado: id },
      relations: ['Estado']
    });
    if (!abonado) {
      throw new BadRequestException(`Abonado fisico con id ${id} no encontrado`);
    }
    return abonado;
  }

  async getAbonadoJuridicoById(id: number)
  {
    const abonado = await this.abonadoJuridicoRepository.findOne({
      where: { Id_Abonado: id },
      relations: ['Estado']
    });
    if (!abonado) {
      throw new BadRequestException(`Abonado juridico con id ${id} no encontrado`);
    }
    else
      return abonado;
  }

  async getAbonadoFisicoByCedula(cedula: string) {
    const abonado = await this.abonadoFisicoRepository.findOne({
      where: { Cedula: cedula },
      relations: ['Estado']
    });

    if (!abonado) {
      throw new BadRequestException(`Abonado fisico con cédula ${cedula} no encontrado`);
    }

    else
      return abonado;
  }

  async getAbonadoJuridicoByCedula(cedula_juridica: string) {
    const abonado = await this.abonadoJuridicoRepository.findOne({
      where: { Cedula_Juridica: cedula_juridica },
      relations: ['Estado']
    });

    if (!abonado) {
      throw new BadRequestException(`Abonado juridico con cédula ${cedula_juridica} no encontrado`);
    }

    return abonado;
  }

  async createAbonadoFisico(solicitud: SolicitudAfiliacionFisica) {
    // Verificar que existe una solicitud de afiliación aprobada para esta cédula
    const solicitudAprobada = await this.solicitudAfiliacionFisicaRepository.findOne({ where: { Cedula: solicitud.Cedula, Estado: { Id_Estado_Solicitud: 3 } }, relations: ['Estado'] });
    if (!solicitudAprobada) { throw new BadRequestException(`No existe una solicitud de afiliación aprobada para la cédula ${solicitud.Cedula}`); }

    // Obtener estado inicial (asumiendo que 1 es "Activo")
    const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
    if (!estadoInicial) { throw new BadRequestException('Estado inicial de abonado no configurado'); }

    const abonado = this.abonadoFisicoRepository.create({
      ...solicitud,
      Estado: estadoInicial
    });

    return this.abonadoFisicoRepository.save(abonado);
  }

  async createAbonadoJuridico(solicitud: SolicitudAfiliacionJuridica) {
    // Verificar que existe una solicitud de afiliación aprobada para esta cédula jurídica
    const SolicitudAprobada = await this.solicitudAfiliacionJuridicaRepository.findOne({ where: { Cedula_Juridica: solicitud.Cedula_Juridica, Estado: { Id_Estado_Solicitud: 3 } }, relations: ['Estado'] });
    if (!SolicitudAprobada) { throw new BadRequestException(`No existe una solicitud de afiliación aprobada para la cédula jurídica ${solicitud.Cedula_Juridica}`); }

    const estadoInicial = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: 1 } });
    if (!estadoInicial) { throw new BadRequestException('Estado inicial de abonado no configurado'); }

    const abonado = this.abonadoJuridicoRepository.create({
      ...solicitud,
      Estado: estadoInicial
    });

    return this.abonadoJuridicoRepository.save(abonado);
  }

  async updateAbonadoFisico(id: number, dto: UpdateAbonadoFisicoDto) {
    const abonado = await this.getAbonadoFisicoById(id);
    Object.assign(abonado, dto);
    return this.abonadoFisicoRepository.save(abonado);
  }

  async updateAbonadoJuridico(id: number, dto: UpdateAbonadoJuridicoDto) {
    const abonado = await this.getAbonadoJuridicoById(id);
    Object.assign(abonado, dto);
    return this.abonadoJuridicoRepository.save(abonado);
  }

  async updateEstadoAbonadoFisico(id: number, nuevoEstadoId: number) {
    const abonado = await this.getAbonadoFisicoById(id);

    const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId }});
    if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

    abonado.Estado = nuevoEstado;
    return this.abonadoFisicoRepository.save(abonado);
  }

  async updateEstadoAbonadoJuridico(id: number, nuevoEstadoId: number) {
    const abonado = await this.getAbonadoJuridicoById(id);

    const nuevoEstado = await this.estadoAfiliadoRepository.findOne({ where: { Id_Estado_Afiliado: nuevoEstadoId }});
    if (!nuevoEstado) { throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`); }

    abonado.Estado = nuevoEstado;
    return this.abonadoJuridicoRepository.save(abonado);
  }

  async deleteAbonadoFisico(id: number) {
    const abonado = await this.getAbonadoFisicoById(id);
    return this.abonadoFisicoRepository.remove(abonado);
  }

  async deleteAbonadoJuridico(id: number) {
    const abonado = await this.getAbonadoJuridicoById(id);
    return this.abonadoJuridicoRepository.remove(abonado);
  }
}