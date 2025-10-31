import { Body, Controller, Get, Param, Post, Patch, UploadedFiles, UseInterceptors, Request} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SugerenciaService } from './sugerencia.service';
import { NumericParamPipe } from 'src/Common/Pipes/numeric-param.pipe';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { CreateSugerenciaDto } from './SugerenciaDTO\'s/CreateSugerencia.dto';
import { ResponderSugerenciaDto } from './SugerenciaDTO\'s/ResponderSugerencia.dto';
import { UpdateSugerenciaEstadoDto } from './SugerenciaDTO\'s/UpdateSugerenciaEstado.dto';

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
  updateEstado(@Param('id', NumericParamPipe) id: number, @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: UpdateSugerenciaEstadoDto, @Request() req: any) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.sugerenciaService.updateEstado(id, body.Id_EstadoSugerencia, idUsuario);
  }

  @Public()
  @Patch(':id/responder')
  responder(
    @Param('id', NumericParamPipe) id: number,
    @Body(new (require('@nestjs/common').ValidationPipe)({ transform: true, whitelist: true })) body: ResponderSugerenciaDto,
    @Request() req: any,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.sugerenciaService.responderSugerencia(id, body, idUsuario);
  }
}