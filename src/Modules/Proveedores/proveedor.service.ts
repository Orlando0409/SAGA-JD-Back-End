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

  findAll() {
    return this.proveedorRepo.find({ relations: ['Estado_Proveedor'] });
  }

  findAllFisico() {
    return this.fisicoRepo.find({ relations: ['Estado_Proveedor'] });
  }

  findAllJuridico() {
    return this.juridicoRepo.find({ relations: ['Estado_Proveedor'] });
  }

  async findOneFisico(id: number) {
    const proveedor = await this.fisicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['Estado_Proveedor'] });
    if (!proveedor) throw new NotFoundException(`Proveedor Físico ${id} no encontrado`);
    return proveedor;
  }

  async findOneJuridico(id: number) {
    const proveedor = await this.juridicoRepo.findOne({ where: { Id_Proveedor: id }, relations: ['Estado_Proveedor'] });
    if (!proveedor) throw new NotFoundException(`Proveedor Jurídico ${id} no encontrado`);
    return proveedor;
  }

  async createFisico(dto: CreateProveedorFisicoDto, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const nombreExistente = await this.fisicoRepo.findOne({where: { Nombre_Proveedor: dto.Nombre_Proveedor }});
    if (nombreExistente) throw new ConflictException('Este nombre ya se encuentra registrado');

    const IdentificacionExistente = await this.fisicoRepo.findOne({where: { Identificacion: dto.Identificacion }});
    if (IdentificacionExistente) throw new ConflictException('Esta identificación ya se encuentra registrada');

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
    if (!estado) throw new NotFoundException('El estado seleccionado no es válido');

    // Crear primero en la tabla base para mantener integridad referencial
    const proveedor = this.proveedorRepo.create({
      ...dto,
      Tipo_Entidad: TipoEntidad.Física,
      Estado_Proveedor: estado,
      Usuario: usuario
    });
    await this.proveedorRepo.save(proveedor);

    // Luego crear en la tabla específica con el mismo ID
    const proveedorFisico = this.fisicoRepo.create({
      ...dto,
      Tipo_Entidad: TipoEntidad.Física,
      Estado_Proveedor: estado,
      Usuario: usuario
    });
    await this.fisicoRepo.save(proveedorFisico);

    try {
      await this.auditoriaService.logCreacion('Proveedores', idUsuario, proveedorFisico.Id_Proveedor, {
        Tipo_Entidad: proveedorFisico.Tipo_Entidad,
        Tipo_Identificacion: proveedorFisico.Tipo_Identificacion,
        Identificacion: proveedorFisico.Identificacion,
        Nombre_Proveedor: proveedorFisico.Nombre_Proveedor,
        Telefono_Proveedor: proveedorFisico.Telefono_Proveedor,
        Id_Estado_Proveedor: estado.Id_Estado_Proveedor,
      });
    } catch (error) {
      console.error('Error al registrar auditoría de creación de Proveedor Físico:', error);
    }

    return {
      ...proveedorFisico,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario)
    }
  }

  async createJuridico(dto: CreateProveedorJuridicoDto, idUsuario: number) {
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
    await this.proveedorRepo.save(proveedor);

    // Luego crear en la tabla específica con el mismo ID
    const proveedorJuridico = this.juridicoRepo.create({
      ...dto,
      Tipo_Entidad: TipoEntidad.Jurídica,
      Estado_Proveedor: estado,
      Usuario: usuario
    });
    await this.juridicoRepo.save(proveedorJuridico);

    try {
      await this.auditoriaService.logCreacion('Proveedores', idUsuario, proveedorJuridico.Id_Proveedor, {
        Tipo_Entidad: proveedorJuridico.Tipo_Entidad,
        Cedula_Juridica: proveedorJuridico.Cedula_Juridica,
        Razon_Social: proveedorJuridico.Razon_Social,
        Nombre_Proveedor: proveedorJuridico.Nombre_Proveedor,
        Telefono_Proveedor: proveedorJuridico.Telefono_Proveedor,
        Id_Estado_Proveedor: estado.Id_Estado_Proveedor,
      });
    } catch (error) {
      console.error('Error al registrar auditoría de creación de Proveedor Jurídico:', error);
    }

    return {
      ...proveedorJuridico,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }

  async updateFisico(id: number, dto: UpdateProveedorFisicoDto, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const datosAnteriores = await this.findOneFisico(id);

    const proveedor = await this.findOneFisico(id);
    Object.assign(proveedor, dto);
    await this.fisicoRepo.save(proveedor);

    try {
      await this.auditoriaService.logActualizacion('Proveedores', idUsuario, proveedor.Id_Proveedor, datosAnteriores, {
        Tipo_Entidad: proveedor.Tipo_Entidad,
        Tipo_Identificacion: proveedor.Tipo_Identificacion,
        Identificacion: proveedor.Identificacion,
        Nombre_Proveedor: proveedor.Nombre_Proveedor,
        Telefono_Proveedor: proveedor.Telefono_Proveedor,
        Id_Estado_Proveedor: proveedor.Estado_Proveedor?.Id_Estado_Proveedor,
      });
    } catch (error) {
      console.error('Error al registrar auditoría de actualización de Proveedor Físico:', error);
    }

    return {
      ...proveedor,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }

  async updateJuridico(id: number, dto: UpdateProveedorJuridicoDto, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const datosAnteriores = await this.findOneJuridico(id);

    const proveedor = await this.findOneJuridico(id);
    Object.assign(proveedor, dto);
    await this.juridicoRepo.save(proveedor);

    try {
      await this.auditoriaService.logActualizacion('Proveedores', idUsuario, proveedor.Id_Proveedor, datosAnteriores, {
        Tipo_Entidad: proveedor.Tipo_Entidad,
        Cedula_Juridica: proveedor.Cedula_Juridica,
        Razon_Social: proveedor.Razon_Social,
        Nombre_Proveedor: proveedor.Nombre_Proveedor,
        Telefono_Proveedor: proveedor.Telefono_Proveedor,
        Id_Estado_Proveedor: proveedor.Estado_Proveedor?.Id_Estado_Proveedor,
      });
    } catch (error) {
      console.error('Error al registrar auditoría de actualización de Proveedor Jurídico:', error);
    }

    return {
      ...proveedor,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }

  //----Actualizar Estado---- 
  async updateEstadoFisico(id: number, dto: UpdateEstadoProveedorDto, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneFisico(id);

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
    if (!estado) throw new NotFoundException('El estado seleccionado no es válido');

    const datosAnteriores = await this.findOneFisico(id);

    proveedor.Estado_Proveedor = estado;

    await this.fisicoRepo.save(proveedor);

    try {
      await this.auditoriaService.logActualizacion('Proveedores', idUsuario, proveedor.Id_Proveedor, datosAnteriores, {
        Id_Estado_Proveedor: estado.Id_Estado_Proveedor
      });
    } catch (error) {
      console.error('Error al registrar auditoría de actualización de estado de Proveedor Físico:', error);
    }

    return {
      ...proveedor,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    }
  }

  async updateEstadoJuridico(id: number, dto: UpdateEstadoProveedorDto, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const proveedor = await this.findOneJuridico(id);

    const estado = await this.estadoRepo.findOne({ where: { Id_Estado_Proveedor: dto.Id_Estado_Proveedor } });
    if (!estado) throw new NotFoundException('El estado seleccionado no es válido');

    const datosAnteriores = await this.findOneJuridico(id);

    proveedor.Estado_Proveedor = estado;

    try {
      await this.auditoriaService.logActualizacion('Proveedores', idUsuario, proveedor.Id_Proveedor, datosAnteriores, {
        Id_Estado_Proveedor: estado.Id_Estado_Proveedor
      });
    } catch (error) {
      console.error('Error al registrar auditoría de actualización de estado de Proveedor Jurídico:', error);
    }

    return {
      ...proveedor,
      Usuario: await this.usuariosService.FormatearUsuarioResponse(usuario),
    };
  }

  async removeFisico(id: number, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const datosEliminados = await this.findOneFisico(id);
    const proveedor = await this.findOneFisico(id);
    await this.fisicoRepo.remove(proveedor);

    try {
      await this.auditoriaService.logEliminacion('Proveedores', idUsuario, datosEliminados.Id_Proveedor, datosEliminados);
    } catch (error) {
      console.error('Error al registrar auditoría de eliminación de Proveedor Físico:', error);
    }

    return { message: 'Proveedor Físico eliminado exitosamente' };
  }

  async removeJuridico(id: number, idUsuario: number) {
    if (!idUsuario) throw new BadRequestException('Debe proporcionar un ID de usuario válido para realizar esta acción');

    const usuario = await this.usuarioRepo.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const datosEliminados = await this.findOneJuridico(id);
    const proveedor = await this.findOneJuridico(id);
    await this.juridicoRepo.remove(proveedor);

    try {
      await this.auditoriaService.logEliminacion('Proveedores', idUsuario, datosEliminados.Id_Proveedor, datosEliminados);
    } catch (error) {
      console.error('Error al registrar auditoría de eliminación de Proveedor Jurídico:', error);
    }

    return { message: 'Proveedor Jurídico eliminado exitosamente' };
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