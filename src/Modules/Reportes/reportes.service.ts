import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from '../Emails/email.service';
import { CreateReporteDto } from './ReporteDTO\'s/CreateReporte.dto';
import { ResponderReporteDto } from './ReporteDTO\'s/ResponderReporte.dto';
import { Reporte } from './ReporteEntities/Reportes.Entity';
import { AuditoriaService } from '../Auditoria/auditoria.service';
import { UsuariosService } from '../Usuarios/Services/usuarios.service';
import { Usuario } from '../Usuarios/UsuarioEntities/Usuario.Entity';
import { EstadoReporte } from './ReporteEntities/EstadoReporte.Entity';

interface ReporteFiles {
  Adjunto?: Express.Multer.File[];
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    @InjectRepository(Reporte)
    private readonly reportesRepository: Repository<Reporte>,

    @InjectRepository(EstadoReporte)
    private readonly estadoReporteRepository: Repository<EstadoReporte>,

    private readonly dropboxFilesService: DropboxFilesService,

    private readonly emailService: EmailService,

    private readonly auditorService: AuditoriaService,

    private readonly usuariosService: UsuariosService,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

  ) { }

  async getAll() {
    return this.reportesRepository.find({ relations: ['Estado'] });
  }

  async getAllArchivados(){
    return this.reportesRepository.find({ where: { Estado: { Id_Estado_Reporte: 3 } }, relations: ['Estado'] });
  }

  async getAllPendientes(){
    return this.reportesRepository.find({ where: { Estado: { Id_Estado_Reporte: 1 } }, relations: ['Estado'] });
  }

  async getAllContestadas(){
    return this.reportesRepository.find({ where: { Estado: { Id_Estado_Reporte: 2 } }, relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.reportesRepository.findOne({ where: { Id_Reporte: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);
    return repo;
  }

  async create(dto: CreateReporteDto, files?: ReporteFiles) {
    const estado = await this.estadoReporteRepository.findOne({ where: { Id_Estado_Reporte: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();
    const nombre = dto.Nombre?.toString().trim();
    const primerApellido = dto.Primer_Apellido?.toString().trim();
    const segundoApellido = dto.Segundo_Apellido?.toString().trim();
    const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
    const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    const reporteData = {
      ...dto,
      Fecha_Reporte: fecha,
      Estado: estado,
    };

    const saved = await this.reportesRepository.save(reporteData);

    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Reportes', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      saved.Adjunto = adjuntoUrls;
      await this.reportesRepository.save(saved);
    }

    if (dto.Correo) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailReporte({
            name: dto.Nombre,
            Papellido: dto.Primer_Apellido,
            Sapellido: dto.Segundo_Apellido,
            Correo: dto.Correo,
            ubicacion: dto.Ubicacion,
            descripcion: dto.Descripcion,
            adjuntos: adjuntoUrls,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de reporte:', error);
        }
      });
    }

    return saved;
  }

  async updateEstado(id: number, nuevoEstadoId: number, idUsuario: number) {

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

    const repo = await this.reportesRepository.findOne({ where: { Id_Reporte: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);

    const nuevoEstado = await this.estadoReporteRepository.findOne({ where: { Id_Estado_Reporte: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    const datosAnteriores = { Id_Estado_Reporte: repo.Estado.Id_Estado_Reporte };

    repo.Estado = nuevoEstado;
    await this.reportesRepository.save(repo);

    try{
      await this.auditorService.logActualizacion('Reportes', idUsuario, id, datosAnteriores, { Id_Estado_Reporte: nuevoEstadoId });
    }catch (error) {
      this.logger.error('Error al registrar auditoría de actualización de reporte:', error);
    }
    return repo;
  }

  async responderReporte(id: number, dto: ResponderReporteDto, idUsuario: number) {

    const usuario = await this.usuarioRepository.findOne({ where: { Id_Usuario: idUsuario } });
    if (!usuario) throw new BadRequestException(`Usuario con id ${idUsuario} no encontrado`);

    const repo = await this.reportesRepository.findOne({
      where: { Id_Reporte: id },
      relations: ['Estado']
    });
    if (!repo) throw new BadRequestException(`Reporte con id ${id} no encontrado`);

    repo.RespuestasReporte = dto.Respuesta;
    const estadoContestada = await this.estadoReporteRepository.findOne({ where: { Id_Estado_Reporte: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    const datosAnteriores = { Respuestas_Reporte : repo.RespuestasReporte}

    repo.Estado = estadoContestada;
    const updatedReporte = await this.reportesRepository.save(repo);

    const correoDestino = repo.Correo;
    if (correoDestino) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarEmailRespuestaReporte({
            name: repo.Nombre,
            Papellido: repo.Primer_Apellido,
            Sapellido: repo.Segundo_Apellido,
            Correo: correoDestino,
            ubicacion: repo.Ubicacion,
            descripcion: repo.Descripcion,
            respuesta: dto.Respuesta,
          });
        } catch (error) {
          this.logger.error('Error al enviar email de respuesta de reporte:', error);
        }
      });
    } else {
      this.logger.warn(`No se puede enviar email de respuesta de reporte: correo no disponible para ID ${id}`);
    }

    try{
      await this.auditorService.logActualizacion('Reportes', idUsuario, id, datosAnteriores, { Respuestas_Reporte: dto.Respuesta });
    }catch (error) {
      this.logger.error('Error al registrar auditoría de actualización de reporte:', error);
    }

    return updatedReporte;
  }
}