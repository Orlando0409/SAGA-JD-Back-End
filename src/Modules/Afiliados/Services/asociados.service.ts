import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudAsociadoFisica, SolicitudAsociadoJuridica } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { AsociadoFisico, AsociadoJuridico } from '../AfiliadoEntities/Asociado.Entity';
import { UpdateAsociadoFisicoDto, UpdateAsociadoJuridicoDto } from '../AfiliadoDTO\'s/UpdateAsociado.dto';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';

@Injectable()
export class AsociadosService {
  constructor(
    @InjectRepository(EstadoAfiliado)
    private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

    @InjectRepository(SolicitudAsociadoFisica)
    private readonly solicitudAsociadoFisicaRepository: Repository<SolicitudAsociadoFisica>,

    @InjectRepository(SolicitudAsociadoJuridica)
    private readonly solicitudAsociadoJuridicaRepository: Repository<SolicitudAsociadoJuridica>,

    @InjectRepository(AsociadoFisico)
    private readonly asociadoFisicoRepository: Repository<AsociadoFisico>,

    @InjectRepository(AsociadoJuridico)
    private readonly asociadoJuridicoRepository: Repository<AsociadoJuridico>,
  ) {}

  async getAllAsociados() 
  {
    return {
      fisicos: await this.asociadoFisicoRepository.find({ relations: ['Estado', 'Tipo_Afiliado'] }),
      juridicos: await this.asociadoJuridicoRepository.find({ relations: ['Estado', 'Tipo_Afiliado'] }),
    }
  }

  async getAsociadosFisicos() {
    return this.asociadoFisicoRepository.find({ relations: ['Estado', 'Tipo_Afiliado'] });
  }

  async getAsociadosJuridicos() {
    return this.asociadoJuridicoRepository.find({ relations: ['Estado', 'Tipo_Afiliado'] });
  }

  async getAsociadoFisicoById(id: number) {
    const asociado = await this.asociadoFisicoRepository.findOne({
      where: { Id_Asociado: id },
      relations: ['Estado']
    });
    if (!asociado) {
      throw new BadRequestException(`Asociado con id ${id} no encontrado`);
    }
    return asociado;
  }

  async getAsociadoJuridicoById(id: number) {
    const asociado = await this.asociadoJuridicoRepository.findOne({
      where: { Id_Asociado: id },
      relations: ['Estado', 'Tipo_Afiliado']
    });
    if (!asociado) {
      throw new BadRequestException(`Asociado con id ${id} no encontrado`);
    }
    return asociado;
  }

  async getAsociadoFisicoByCedula(cedula: string) {
    return this.asociadoFisicoRepository.findOne({
      where: { Cedula: cedula },
      relations: ['Estado', 'Tipo_Afiliado']
    });
  }

  async getAsociadoJuridicoByCedula(cedula: string) {
    return this.asociadoJuridicoRepository.findOne({
      where: { Cedula_Juridica: cedula },
      relations: ['Estado', 'Tipo_Afiliado']
    });
  }

  async createAsociadoFisico(solicitud: SolicitudAsociadoFisica) {
    const AsociadoExistente = await this.getAsociadoFisicoByCedula(solicitud.Cedula);
    if (AsociadoExistente) {
      throw new BadRequestException(`Ya existe un asociado físico con la cédula ${solicitud.Cedula}`);
    }

    // Verificar que existe una solicitud de asociado aprobada para esta cédula
    const solicitudAprobada = await this.solicitudAsociadoFisicaRepository.findOne({
      where: {
        Cedula: solicitud.Cedula,
        Estado: { Id_Estado_Solicitud: 3 } // Estado aprobada
      },
      relations: ['Estado']
    });

    if (!solicitudAprobada) {
      throw new BadRequestException(`No existe una solicitud de asociado aprobada para la cédula ${solicitud.Cedula}`);
    }

    // Obtener estado inicial (asumiendo que 1 es "Activo")
    const estadoInicial = await this.estadoAfiliadoRepository.findOne({
      where: { Id_Estado_Afiliado: 1 }
    });
    if (!estadoInicial) {
      throw new BadRequestException('Estado inicial de afiliado no configurado');
    }

    const asociado = this.asociadoFisicoRepository.create({
      ...solicitud,
      Estado: estadoInicial
    });

    return this.asociadoFisicoRepository.save(asociado);
  }

  async createAsociadoJuridico(solicitud: SolicitudAsociadoJuridica) {
    const AsociadoExistente = await this.getAsociadoJuridicoByCedula(solicitud.Cedula_Juridica);
    if (AsociadoExistente) {
      throw new BadRequestException(`Ya existe un asociado jurídico con la cédula jurídica ${solicitud.Cedula_Juridica}`);
    }

    // Verificar que existe una solicitud de asociado aprobada para esta cédula jurídica
    const solicitudAprobada = await this.solicitudAsociadoJuridicaRepository.findOne({
      where: {
        Cedula_Juridica: solicitud.Cedula_Juridica,
        Estado: { Id_Estado_Solicitud: 3 } // Estado aprobada
      },
      relations: ['Estado']
    });

    if (!solicitudAprobada) {
      throw new BadRequestException(`No existe una solicitud de asociado aprobada para la cédula jurídica ${solicitud.Cedula_Juridica}`);
    }

    // Obtener estado inicial (asumiendo que 1 es "Activo")
    const estadoInicial = await this.estadoAfiliadoRepository.findOne({
      where: { Id_Estado_Afiliado: 1 }
    });
    if (!estadoInicial) {
      throw new BadRequestException('Estado inicial de afiliado no configurado');
    }

    const asociado = this.asociadoJuridicoRepository.create({
      ...solicitud,
      Estado: estadoInicial
    });

    return this.asociadoJuridicoRepository.save(asociado);
  }

  async updateAsociadoFisico(id: number, dto: UpdateAsociadoFisicoDto) {
    const asociado = await this.getAsociadoFisicoById(id);
    Object.assign(asociado, dto);
    return this.asociadoFisicoRepository.save(asociado);
  }

  async updateAsociadoJuridico(id: number, dto: UpdateAsociadoJuridicoDto) {
    const asociado = await this.getAsociadoJuridicoById(id);
    Object.assign(asociado, dto);
    return this.asociadoJuridicoRepository.save(asociado);
  }

  async updateEstadoAsociadoFisico(id: number, nuevoEstadoId: number) {
    const asociado = await this.getAsociadoFisicoById(id);
    const AsociadoExistente = await this.getAsociadoFisicoByCedula(asociado.Cedula);
    const nuevoEstado = await this.estadoAfiliadoRepository.findOne({
      where: { Id_Estado_Afiliado: nuevoEstadoId }
    });
    if (!nuevoEstado) {
      throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);
    }

    if (nuevoEstadoId === 3) {
      if (AsociadoExistente) {
        throw new BadRequestException(`Ya existe un asociado físico con la cédula ${asociado.Cedula}`);
      }
    } else {
      asociado.Estado = nuevoEstado;
      return this.asociadoFisicoRepository.save(asociado);
    }
  }

  async updateEstadoAsociadoJuridico(id: number, nuevoEstadoId: number) {
    const asociado = await this.getAsociadoJuridicoById(id);

    const nuevoEstado = await this.estadoAfiliadoRepository.findOne({
      where: { Id_Estado_Afiliado: nuevoEstadoId }
    });
    if (!nuevoEstado) {
      throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);
    }

    asociado.Estado = nuevoEstado;
    return this.asociadoJuridicoRepository.save(asociado);
  }

  async deleteAsociadoFisico(id: number) {
    const asociado = await this.getAsociadoFisicoById(id);
    return this.asociadoFisicoRepository.remove(asociado);
  }

  async deleteAsociadoJuridico(id: number) {
    const asociado = await this.getAsociadoJuridicoById(id);
    return this.asociadoJuridicoRepository.remove(asociado);
  }
}