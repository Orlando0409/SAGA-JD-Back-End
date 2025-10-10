import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportesEntity } from './ReportesEntity/ReportesEntity';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { EstadoReporte } from './ReportesEntity/EstadoReporte';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);
  constructor(
    @InjectRepository(ReportesEntity)
    private readonly reportesRepository: Repository<ReportesEntity>,

    @InjectRepository(EstadoReporte)
    private readonly estadoReporteRepository: Repository<EstadoReporte>,

    private readonly dropboxFilesService: DropboxFilesService,
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

  const nombre = (dto.name || dto.Name || dto.Nombre || '')?.toString().trim();
  const primerApellido = (dto.Papellido || dto.P_apellido || dto.Primer_Apellido || '')?.toString().trim();
  const segundoApellido = (dto.Sapellido || dto.S_apellido || dto.Segundo_Apellido || '')?.toString().trim();
    const primerNombre = nombre ? nombre.split(' ')[0] : '';
    const folderName = [primerNombre, primerApellido, segundoApellido].filter(Boolean).join(' ').trim();

    const archivosAdjuntos: string[] = [];
    if (files?.Imagen || files?.Adjunto) {
      const archivos = Array.isArray(files.Imagen) ? files.Imagen : Array.isArray(files.Adjunto) ? files.Adjunto : files.Imagen ? [files.Imagen] : files.Adjunto ? [files.Adjunto] : [];
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

    return this.reportesRepository.save(reporte);
  }

  async remove(id: number) {
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) throw new BadRequestException(`Id de reporte inválido: ${id}`);
    const repo = await this.reportesRepository.findOne({ where: { IdReporte: idNum } });
    if (!repo) throw new BadRequestException(`Reporte con id ${idNum} no encontrado`);

  const nombre = (repo?.name || '').toString().trim();
  const primerNombre = nombre ? nombre.split(' ')[0] : '';
    const primerApellido = (repo?.Papellido || '').toString().trim();
    const segundoApellido = (repo?.Sapellido || '').toString().trim();
    const folderName = `${[primerNombre, primerApellido, segundoApellido].filter(Boolean).join(' ')}`.trim();

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
    return this.reportesRepository.save(repo);
  }
}
