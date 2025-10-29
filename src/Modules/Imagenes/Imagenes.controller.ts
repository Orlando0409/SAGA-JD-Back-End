import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from './Imagenes.service';
import { CreateImagenDto } from "./ImagenesDTO's/CreateImagen.dto";
import { UpdateImagenDto } from "./ImagenesDTO's/UpdateImagen.dto";
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { Public } from '../auth/Decorator/Public.decorator';

@Controller('imagenes')
@UseGuards(JwtAuthGuard)
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.imagenesService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.imagenesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('Imagen'))
  async create(
    @Body() createImagenDto: CreateImagenDto,
    @UploadedFile() Imagen: Express.Multer.File,
    @Request() req: any,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.imagenesService.create(createImagenDto, idUsuario, Imagen);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('Imagen'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImagenDto: UpdateImagenDto,
    @Request() req: any,
    @UploadedFile() Imagen?: Express.Multer.File,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.imagenesService.update(id, updateImagenDto, idUsuario, Imagen);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
    return this.imagenesService.remove(id, idUsuario);
  }
}