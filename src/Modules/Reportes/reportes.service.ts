import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportesEntity } from './ReportesEntity/ReportesEntity';
import { EstadoReporte } from './ReportesEntity/EstadoReporte';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EmailService } from 'src/Modules/Emails/email.service';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);
  constructor(
    @InjectRepository(ReportesEntity)
    private readonly reportesRepository: Repository<ReportesEntity>,

    @InjectRepository(EstadoReporte)
    private readonly estadoReporteRepository: Repository<EstadoReporte>,

    private readonly dropboxFilesService: DropboxFilesService,
    private readonly emailService: EmailService,
  ) {}

  async getAll() {
    return this.reportesRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de reporte invalido: ${id}`);
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: idNum }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${idNum} no encontrado`);
    return repo;
  }

  async create(dto: any, files?: any) {
    const estado = await this.estadoReporteRepository.findOne({ where: { IdEstadoReporte: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    const fecha = new Date();

  const nombre = (dto.name)?.toString().trim();
  const primerApellido = (dto.Papellido)?.toString().trim();
  const segundoApellido = (dto.Sapellido)?.toString().trim();
   
    const fullName = nombre || '';
  const rawFolder = [fullName, primerApellido, segundoApellido].filter(Boolean).join(' ');
 
  const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    const archivosAdjuntos: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Reportes', undefined, folderName);
        if (res?.url) archivosAdjuntos.push(res.url);
      }
    }

    const reporte = this.reportesRepository.create({
      ...dto,
      Fecha_Reporte: fecha,
      Adjunto: archivosAdjuntos,
      Estado: estado,
    });
    const saved = await this.reportesRepository.save(reporte);

    // Intentar enviar correo al usuario con la información del reporte.
    // No debe bloquear la operación principal si falla el envío.
    (async () => {
      try {
        await this.emailService.enviarEmailReporte({
          name: dto.name,
          Papellido: dto.Papellido,
          Sapellido: dto.Sapellido,
          Correo: dto.Correo,
          ubicacion: dto.ubicacion,
          descripcion: dto.descripcion,
          adjuntos: archivosAdjuntos,
        });
      } catch (err) {
        const savedId = Array.isArray(saved) ? (saved[0] as any)?.IdReporte : (saved as any)?.IdReporte;
        this.logger.warn(`No se pudo enviar email de reporte para id ${savedId}: ${err}`);
      }
    })();

    return saved;
  }

  async remove(id: number) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de reporte inválido: ${id}`);
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: idNum } });
    if (!repo) throw new BadRequestException(`Reporte con id ${idNum} no encontrado`);

  const nombre = (repo?.name)?.toString().trim();
  const primerApellido = (repo?.Papellido)?.toString().trim();
  const segundoApellido = (repo?.Sapellido)?.toString().trim();
  const rawFolder = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ');
  const folderName = rawFolder.replace(/[\\/\:\*\?"<>\|]/g, '').replace(/\s+/g, ' ').trim();

    try {
      await this.dropboxFilesService.deletePath('Contacto', 'Reportes', undefined, folderName);
    } catch (error) {
      this.logger.warn(`No se pudo eliminar carpeta en Dropbox para reporte ${idNum}: ${error}`);
    }

    return this.reportesRepository.remove(repo);
  }

  async updateEstadoReporte(id: number, nuevoEstadoId: number) {
    const idNum = Number(id);
    const estadoNum = Number(nuevoEstadoId);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de reporte invalido: ${id}`);
    if (!Number.isInteger(estadoNum) || estadoNum <= 0) throw new BadRequestException(`Id de estado invalido: ${nuevoEstadoId}`);
    // Solo permitir estados 1 (pendiente) y 2 (revisado)
    if (![1, 2].includes(estadoNum)) throw new BadRequestException(`Id de estado no permitido: ${estadoNum}`);
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: idNum }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${idNum} no encontrado`);

    const nuevoEstado = await this.estadoReporteRepository.findOne({ where: { IdEstadoReporte: estadoNum } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${estadoNum} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.reportesRepository.save(repo);
  }

  async responderReporte(id: number, respuesta: string) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de reporte invalido: ${id}`);

    const repo = await this.reportesRepository.findOne({ where: { IdReporte: idNum }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Reporte con id ${idNum} no encontrado`);

    // Asignar respuesta y cambiar estado a 2 (contestada)
    repo.RespuestasReporte = respuesta;

    const estadoContestada = await this.estadoReporteRepository.findOne({ where: { IdEstadoReporte: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada (2) no encontrado');

    repo.Estado = estadoContestada;
    const saved = await this.reportesRepository.save(repo);

    // Enviar correo al usuario con la respuesta del administrador (no bloqueante)
    (async () => {
      try {
        await this.emailService.enviarEmailRespuestaReporte({
          name: saved.name,
          Papellido: saved.Papellido,
          Sapellido: saved.Sapellido,
          Correo: saved.Correo,
          ubicacion: saved.ubicacion,
          descripcion: saved.descripcion,
          respuesta: respuesta,
        });
      } catch (err) {
        this.logger.warn(`No se pudo enviar email de respuesta para reporte ${saved.IdReporte}: ${err}`);
      }
    })();

    return saved;
  }
}
