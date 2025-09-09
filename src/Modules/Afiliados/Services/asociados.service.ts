import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudAsociado } from '../../Solicitudes/SolicitudEntities/Solicitud.Entity';
import { Asociado } from '../AfiliadoEntities/Asociado.Entity';
import { CreateAsociadoDto } from '../AfiliadoDTO\'s/CreateAsociado.dto';
import { UpdateAsociadoDto } from '../AfiliadoDTO\'s/UpdateAsociado.dto';
import { EstadoAfiliado } from '../AfiliadoEntities/EstadoAfiliado.Entity';

@Injectable()
export class AsociadosService {
  constructor(
    @InjectRepository(Asociado)
    private readonly asociadoRepository: Repository<Asociado>,

    @InjectRepository(EstadoAfiliado)
    private readonly estadoAfiliadoRepository: Repository<EstadoAfiliado>,

    @InjectRepository(SolicitudAsociado)
    private readonly solicitudAsociadoRepository: Repository<SolicitudAsociado>,
  ) {}

  async getAllAsociados() {
    return this.asociadoRepository.find({ relations: ['Estado'] });
  }

  async getAsociadoById(id: number) {
    const asociado = await this.asociadoRepository.findOne({
      where: { Id_Asociado: id },
      relations: ['Estado']
    });
    if (!asociado) {
      throw new BadRequestException(`Asociado con id ${id} no encontrado`);
    }
    return asociado;
  }

  async getAsociadoByCedula(cedula: string) {
    return this.asociadoRepository.findOne({
      where: { Cedula: cedula },
      relations: ['Estado']
    });
  }

  async createAsociado(dto: CreateAsociadoDto) {
    // Verificar si ya existe un asociado con esa cédula
    const existingAsociado = await this.getAsociadoByCedula(dto.Cedula);
    if (existingAsociado) {
      throw new BadRequestException(`Ya existe un asociado con la cédula ${dto.Cedula}`);
    }

    // Verificar que existe una solicitud de asociado aprobada para esta cédula
    const solicitudAprobada = await this.solicitudAsociadoRepository.findOne({
      where: { 
        Cedula: dto.Cedula,
        Estado: { Id_Estado_Solicitud: 3 } // Estado aprobada
      },
      relations: ['Estado']
    });

    if (!solicitudAprobada) {
      throw new BadRequestException(`No existe una solicitud de asociado aprobada para la cédula ${dto.Cedula}`);
    }

    // Obtener estado inicial (asumiendo que 1 es "Activo")
    const estadoInicial = await this.estadoAfiliadoRepository.findOne({
      where: { Id_Estado_Afiliado: 1 }
    });
    if (!estadoInicial) {
      throw new BadRequestException('Estado inicial de afiliado no configurado');
    }

    const asociado = this.asociadoRepository.create({
      ...dto,
      Estado: estadoInicial
    });

    return this.asociadoRepository.save(asociado);
  }

  async updateAsociado(id: number, dto: UpdateAsociadoDto) {
    const asociado = await this.getAsociadoById(id);
    Object.assign(asociado, dto);
    return this.asociadoRepository.save(asociado);
  }

  async updateEstadoAsociado(id: number, nuevoEstadoId: number) {
    const asociado = await this.getAsociadoById(id);
    
    const nuevoEstado = await this.estadoAfiliadoRepository.findOne({
      where: { Id_Estado_Afiliado: nuevoEstadoId }
    });
    if (!nuevoEstado) {
      throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);
    }

    asociado.Estado = nuevoEstado;
    return this.asociadoRepository.save(asociado);
  }

  async deleteAsociado(id: number) {
    const asociado = await this.getAsociadoById(id);
    return this.asociadoRepository.remove(asociado);
  }

  // Método específico para crear asociado desde solicitud aprobada
  async createAsociadoFromSolicitud(solicitudData: any) {
    const createDto: CreateAsociadoDto = {
      Cedula: solicitudData.Cedula,
      Nombre: solicitudData.Nombre,
      Apellido1: solicitudData.Apellido1,
      Apellido2: solicitudData.Apellido2,
      Correo: solicitudData.Correo,
      Numero_Telefono: solicitudData.Numero_Telefono,
      Motivo_Solicitud: solicitudData.Motivo_Solicitud,
    };

    return this.createAsociado(createDto);
  }
}
