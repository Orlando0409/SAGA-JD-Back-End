import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagenesController } from './Imagenes.controller';
import { ImagenesService } from './Imagenes.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';
import { ImagenEntity } from './ImagenesEntity/ImagenEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImagenEntity]), 
    DropboxModule
  ],
  controllers: [ImagenesController],
  providers: [ImagenesService],
})
export class ImagenesModule {}