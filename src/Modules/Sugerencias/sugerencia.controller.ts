import { Body, Controller, Delete, Get, Param, Post, Patch, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SugerenciaService } from './sugerencia.service';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSugerenciaDto } from './SugerenciaDTO\'S/CreateSugerencia.dto';
import { UpdateSugerenciaEstadoDto } from './SugerenciaDTO\'S/UpdateSugerenciaEstado.dto';
import { ResponderSugerenciaDto } from './SugerenciaDTO\'S/ResponderSugerencia.dto';

@Controller('sugerencias')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) { }

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
    return this.sugerenciaService.updateEstado(id, body.Id_EstadoSugerencia);
  }

  @Public()
  @Post(':id/responder')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: ResponderSugerenciaDto,
  ) {
    return this.sugerenciaService.responderSugerencia(id, body);
  }

  @Delete(':id')
  remove(@Param('id', NumericParamPipe) id: number) {
    return this.sugerenciaService.remove(id);
  }
}
