import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor, ProveedorFisico, ProveedorJuridico } from './ProveedorEntities/Proveedor.Entity';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './ProveedoresDTOs/CreateProveedor.dto';
import { UpdateProveedorFisicoDto, UpdateProveedorJuridicoDto } from './ProveedoresDTOs/UpdateProveedor.dto';
import { EstadoProveedor } from './ProveedorEntities/EstadoProveedor.Entity';
import { UpdateEstadoProveedorDto } from './ProveedoresDTOs/UpdateEstadoProveedor.dto';
import { TipoEntidad } from 'src/Common/Enums/TipoEntidad.enum';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { AuditoriaService } from '../Auditoria/auditoria.service';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';

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

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,

    private auditoriaService: AuditoriaService,

    private usuariosService: UsuariosService,
  ) { }

  async createFisico(dto: CreateProveedorFisicoDto, idUsuario: number): Promise<ProveedorFisico> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

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

    // Crear primero en la tabla base para mantener integridad referencial
    const proveedor = this.proveedorRepo.create({
      ...dto,
      Tipo_Entidad: TipoEntidad.Física,
      Estado_Proveedor: estado,
       Usuario: usuario
      
    });
    const proveedorBase = await this.proveedorRepo.save(proveedor);

    // Luego crear en la tabla específica con el mismo ID
    const proveedorFisico = this.fisicoRepo.create({
      ...dto,
      Id_Proveedor : proveedorBase.Id_Proveedor,
      Tipo_Entidad: TipoEntidad.Física,
      Estado_Proveedor: estado,
      Usuario: usuario
    });

    return this.fisicoRepo.save(proveedorFisico);
  }

  async createJuridico(dto: CreateProveedorJuridicoDto, idUsuario: number): Promise<ProveedorJuridico> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

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

    // Crear primero en la tabla base para mantener integridad referencial
    const proveedor = this.proveedorRepo.create({
      ...dto,
      Tipo_Entidad: TipoEntidad.Jurídica,
      Estado_Proveedor: estado,
      Usuario: usuario
    });
    const proveedorBase = await this.proveedorRepo.save(proveedor);

    // Luego crear en la tabla específica con el mismo ID
    const proveedorJuridico = this.juridicoRepo.create({
      ...dto,
      Id_Proveedor : proveedorBase.Id_Proveedor,
      Tipo_Entidad: TipoEntidad.Jurídica,
      Estado_Proveedor: estado,
      Usuario: usuario

    });

    return this.juridicoRepo.save(proveedorJuridico);
  }

  findAll(): Promise<Proveedor[]> {
    return this.proveedorRepo.find({ relations: ['Estado_Proveedor'] });
  }

  findAllFisico(): Promise<ProveedorFisico[]> {
    return this.fisicoRepo.find({ relations: ['Estado_Proveedor'] });
  }

  findAllJuridico(): Promise<ProveedorJuridico[]> {
    return this.juridicoRepo.find({ relations: ['Estado_Proveedor'] });
  }

  async findOneFisico(id: number): Promise<ProveedorFisico> {
    const proveedor = await this.fisicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['Estado_Proveedor'] });
    if (!proveedor) throw new NotFoundException(`Proveedor Físico ${id} no encontrado`);
    return proveedor;
  }

  async findOneJuridico(id: number): Promise<ProveedorJuridico> {
    const proveedor = await this.juridicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['Estado_Proveedor'] });
    if (!proveedor) throw new NotFoundException(`Proveedor Jurídico ${id} no encontrado`);
    return proveedor;
  }

  async updateFisico(id: number, dto: UpdateProveedorFisicoDto, idUsuario: number): Promise<ProveedorFisico> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneFisico(id);

    // Excluir explícitamente tipo_identificacion de la actualización
     Object.assign(proveedor, dto);

    return this.fisicoRepo.save(proveedor);
  }

  async updateJuridico(id: number, dto: UpdateProveedorJuridicoDto, idUsuario: number): Promise<ProveedorJuridico> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneJuridico(id);
    Object.assign(proveedor, dto);
    return this.juridicoRepo.save(proveedor);
  }

  //----Actualizar Estado---- 
  async updateEstadoFisico(id: number, dto: UpdateEstadoProveedorDto, idUsuario: number): Promise<ProveedorFisico> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneFisico(id);

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });

    if (!estado) {
      throw new NotFoundException('El estado seleccionado no es válido');
    }

    proveedor.Estado_Proveedor = estado;

    return this.fisicoRepo.save(proveedor);
  }

  async updateEstadoJuridico(id: number, dto: UpdateEstadoProveedorDto, idUsuario: number): Promise<ProveedorJuridico> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneJuridico(id);

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });

    if (!estado) {
      throw new NotFoundException('El estado seleccionado no es válido');
    }

    proveedor.Estado_Proveedor = estado;

    return this.juridicoRepo.save(proveedor);
  }

  async removeFisico(id: number, idUsuario: number): Promise<void> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneFisico(id);
    await this.fisicoRepo.remove(proveedor);
  }

  async removeJuridico(id: number, idUsuario: number): Promise<void> {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneJuridico(id);
    await this.juridicoRepo.remove(proveedor);
  }

  /**
   * Formatea la información de un proveedor físico para responses públicos
   * Solo devuelve información básica y necesaria
   */
  async FormatearProveedorFisicoParaResponse(proveedor: ProveedorFisico): Promise<{
    Id_Proveedor: number;
    Tipo_Entidad: number;
    Nombre_Proveedor: string;
    Telefono_Proveedor: string;
    Tipo_Identificacion: string;
    Identificacion: string;
    Estado: {
      Id_Estado_Proveedor: number;
      Nombre_Estado_Proveedor: string;
    };
  }> {
    return {
      Id_Proveedor: proveedor.Id_Proveedor,
      Tipo_Entidad: proveedor.Tipo_Entidad, // 1 = Física
      Nombre_Proveedor: proveedor.Nombre_Proveedor,
      Telefono_Proveedor: proveedor.Telefono_Proveedor,
      Tipo_Identificacion: proveedor.Tipo_Identificacion,
      Identificacion: proveedor.Identificacion,
      Estado: {
        Id_Estado_Proveedor: proveedor.Estado_Proveedor?.Id_Estado_Proveedor || 0,
        Nombre_Estado_Proveedor: proveedor.Estado_Proveedor?.Estado_Proveedor || 'Sin estado'
      }
    };
  }

  /**
   * Formatea la información de un proveedor jurídico para responses públicos
   * Solo devuelve información básica y necesaria
   */
  async FormatearProveedorJuridicoParaResponse(proveedor: ProveedorJuridico): Promise<{
    Id_Proveedor: number;
    Tipo_Entidad: number;
    Nombre_Proveedor: string;
    Telefono_Proveedor: string;
    Cedula_Juridica: string;
    Razon_Social: string;
    Estado: {
      Id_Estado_Proveedor: number;
      Nombre_Estado_Proveedor: string;
    };
  }> {
    return {
      Id_Proveedor: proveedor.Id_Proveedor,
      Tipo_Entidad: proveedor.Tipo_Entidad, // 2 = Jurídica
      Nombre_Proveedor: proveedor.Nombre_Proveedor,
      Telefono_Proveedor: proveedor.Telefono_Proveedor,
      Cedula_Juridica: proveedor.Cedula_Juridica,
      Razon_Social: proveedor.Razon_Social,
      Estado: {
        Id_Estado_Proveedor: proveedor.Estado_Proveedor?.Id_Estado_Proveedor || 0,
        Nombre_Estado_Proveedor: proveedor.Estado_Proveedor?.Estado_Proveedor || 'Sin estado'
      }
    };
  }

  /**
   * Método universal para formatear cualquier tipo de proveedor
   * Determina automáticamente el tipo y aplica el formateo correcto
   * Si los campos específicos no están cargados, hace una query adicional
   */
  async FormatearProveedorParaResponse(proveedor: Proveedor | ProveedorFisico | ProveedorJuridico): Promise<any> {
    // Determinar el tipo usando Tipo_Entidad (1 = Física, 2 = Jurídica)
    const tipoEntidad = (proveedor as any).Tipo_Entidad;

    // Si el tipo es 1 (Física)
    if (tipoEntidad === 1 || tipoEntidad === TipoEntidad.Física) {
      // Si ya tiene los campos específicos, usarlos directamente
      if ('Tipo_Identificacion' in proveedor && 'Identificacion' in proveedor) {
        return await this.FormatearProveedorFisicoParaResponse(proveedor as ProveedorFisico);
      }
      // Si no, cargar el proveedor físico completo desde la tabla específica
      const proveedorFisico = await this.fisicoRepo.findOne({
        where: { Id_Proveedor: proveedor.Id_Proveedor },
        relations: ['Estado_Proveedor']
      });
      if (proveedorFisico) {
        return await this.FormatearProveedorFisicoParaResponse(proveedorFisico);
      }
    }

    // Si el tipo es 2 (Jurídica)
    else if (tipoEntidad === 2 || tipoEntidad === TipoEntidad.Jurídica) {
      // Si ya tiene los campos específicos, usarlos directamente
      if ('Cedula_Juridica' in proveedor && 'Razon_Social' in proveedor) {
        return await this.FormatearProveedorJuridicoParaResponse(proveedor as ProveedorJuridico);
      }
      // Si no, cargar el proveedor jurídico completo desde la tabla específica
      const proveedorJuridico = await this.juridicoRepo.findOne({
        where: { Id_Proveedor: proveedor.Id_Proveedor },
        relations: ['Estado_Proveedor']
      });
      if (proveedorJuridico) {
        return await this.FormatearProveedorJuridicoParaResponse(proveedorJuridico);
      }
    }

    // Fallback para casos edge - devolver como objeto básico
    return {
      Id_Proveedor: (proveedor as any).Id_Proveedor,
      Tipo_Entidad: tipoEntidad || 0,
      Nombre_Proveedor: (proveedor as any).Nombre_Proveedor,
      Telefono_Proveedor: (proveedor as any).Telefono_Proveedor,
      Estado: {
        Id_Estado_Proveedor: (proveedor as any).Estado_Proveedor?.Id_Estado_Proveedor || 0,
        Nombre_Estado_Proveedor: (proveedor as any).Estado_Proveedor?.Estado_Proveedor || 'Sin estado'
      }
    };
  }
}