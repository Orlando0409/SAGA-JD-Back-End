import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SugerenciaEntity } from './Entity/SugerenciaEntity';
import { Estado_Sugerencia } from './Entity/EstadoSugerencia';
import { DropboxFilesService } from 'src/Dropbox/Files/DropboxFiles.service';
import { CreateSugerenciaDto } from './Dto/CreateSugerencia.dto';

@Injectable()
export class SugerenciaService {
  
  constructor(
    @InjectRepository(SugerenciaEntity)
    private readonly sugerenciaRepository: Repository<SugerenciaEntity>,

    @InjectRepository(Estado_Sugerencia)
    private readonly estadoRepository: Repository<Estado_Sugerencia>,

    private readonly dropboxFilesService: DropboxFilesService,
  ) {}

  async getAll() {
    return this.sugerenciaRepository.find({ relations: ['Estado'] });
  }

  async getOne(id: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);
    return repo;
  }

  async create(dto: CreateSugerenciaDto, files?: any) {
    const estado = await this.estadoRepository.findOne({ where: { Id_EstadoSugerencia: 1 } });
    if (!estado) throw new BadRequestException('Estado por defecto no encontrado');

    
    const fecha = new Date();
    const sugerencia = this.sugerenciaRepository.create({
      ...dto,
      Fecha_Sugerencia: fecha,
      Estado: estado,
    });

  
  const insertRes = await this.sugerenciaRepository.insert(sugerencia as any);
  const generatedId = insertRes.identifiers && insertRes.identifiers[0] ? insertRes.identifiers[0].Id_Sugerencia || insertRes.identifiers[0].id : null;
  const saved = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: generatedId } }) as SugerenciaEntity;

    
    const adjuntoUrls: string[] = [];
    if (files?.Adjunto) {
      const archivos = Array.isArray(files.Adjunto) ? files.Adjunto : [files.Adjunto];
      const folderName = `sugerencia_${saved.Id_Sugerencia}`;
      for (const file of archivos) {
        const res = await this.dropboxFilesService.uploadFile(file, 'Contacto', 'Sugerencias', undefined, folderName);
        if (res?.url) adjuntoUrls.push(res.url);
      }

      saved.Adjunto = adjuntoUrls;
  await this.sugerenciaRepository.save(saved);
    }
    return saved;
  }

  async updateEstado(id: number, nuevoEstadoId: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    const nuevoEstado = await this.estadoRepository.findOne({ where: { Id_EstadoSugerencia: nuevoEstadoId } });
    if (!nuevoEstado) throw new BadRequestException(`Estado con id ${nuevoEstadoId} no encontrado`);

    repo.Estado = nuevoEstado;
    return this.sugerenciaRepository.save(repo);
  }

  async responderSugerencia(id: number, respuesta: string) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id }, relations: ['Estado'] });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    repo.RespuestasSugerencia = respuesta;
    const estadoContestada = await this.estadoRepository.findOne({ where: { Id_EstadoSugerencia: 2 } });
    if (!estadoContestada) throw new BadRequestException('Estado contestada no encontrado');

    repo.Estado = estadoContestada;
    return this.sugerenciaRepository.save(repo);
  }

  async remove(id: number) {
    const repo = await this.sugerenciaRepository.findOne({ where: { Id_Sugerencia: id } });
    if (!repo) throw new BadRequestException(`Sugerencia con id ${id} no encontrada`);

    try {
      const folderName = `sugerencia_${id}`;
      await this.dropboxFilesService.deletePath('Contacto', 'Sugerencias', undefined, folderName);
    } catch (err) {
      console.warn(`No se pudo eliminar carpeta en Dropbox para sugerencia ${id}: ${err}`);
    }

    return this.sugerenciaRepository.remove(repo);
  }
}
