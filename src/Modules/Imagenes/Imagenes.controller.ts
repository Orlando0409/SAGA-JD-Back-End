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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from './Imagenes.service';
import { CreateImagenDto } from "./ImagenesDTO's/CreateImagen.dto";
import { UpdateImagenDto } from "./ImagenesDTO's/UpdateImagen.dto";
import { ImagenEntity } from './ImagenesEntity/ImagenEntity';

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Get()
  async findAll(): Promise<ImagenEntity[]> {
    return this.imagenesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ImagenEntity> {
    return this.imagenesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('Imagen'))
  async create(
    @Body() createImagenDto: CreateImagenDto,
    @UploadedFile() Imagen: Express.Multer.File,
  ): Promise<ImagenEntity> {
    return this.imagenesService.create(createImagenDto, Imagen);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('Imagen'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImagenDto: UpdateImagenDto,
    @UploadedFile() Imagen?: Express.Multer.File,
  ): Promise<ImagenEntity> {
    return this.imagenesService.update(id, updateImagenDto, Imagen);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.imagenesService.remove(id);
  }
}