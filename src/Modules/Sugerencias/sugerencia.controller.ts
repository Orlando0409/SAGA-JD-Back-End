import { Body, Controller, Delete, Get, Param, Post, Patch, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SugerenciaService } from './sugerencia.service';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { UpdateSugerenciaEstadoDto } from './SugerenciaDTO\'S/UpdateSugerenciaEstado.dto';
import { CreateSugerenciaDto } from './SugerenciaDTO\'S/CreateSugerencia.dto';
import { Public } from '../auth/Decorator/Public.decorator';

@Controller('sugerencias')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @Get()
  getAll() {
    return this.sugerenciaService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', NumericParamPipe) id: number) {
    return this.sugerenciaService.getOne(id);
  }

  @Public()
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'Adjunto', maxCount: 10 },
  ]))
  create(
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true, forbidUnknownValues: false })) body: CreateSugerenciaDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    return this.sugerenciaService.create(body, files);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id', NumericParamPipe) id: number, @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: UpdateSugerenciaEstadoDto) {
    const nuevo = (body as any)?.Id_EstadoSugerencia ?? (body as any)?.IdEstadoSugerencia ?? (body as any)?.Id_EstadoSugerencia;
    return this.sugerenciaService.updateEstado(id, nuevo as number);
  }

  @Post(':id/responder')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body('respuesta') respuestaField: any,
    @Body() rawBody: any,
  ) {
    // extraer la respuesta del body de forma segura (JSON form-data o raw text)
    let respuesta = respuestaField;
    if (!respuesta) {
      if (rawBody && typeof rawBody === 'object') {
        respuesta = (rawBody as any).respuesta ?? (rawBody as any).Respuesta ?? (rawBody as any).respuesta;
      } else if (typeof rawBody === 'string') {
        respuesta = rawBody;
      }
    }

    if (!respuesta) throw new BadRequestException('respuesta es requerida');
    return this.sugerenciaService.responderSugerencia(id, respuesta);
  }

  @Delete(':id')
  remove(@Param('id', NumericParamPipe) id: number) {
    return this.sugerenciaService.remove(id);
  }
}
