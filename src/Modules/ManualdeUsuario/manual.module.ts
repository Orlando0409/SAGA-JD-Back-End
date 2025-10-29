import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualEntity } from './ManualEntity/manual.entity';
import { ManualController } from './manual.controller';
import { ManualService } from './manual.service';
import { DropboxModule } from 'src/Dropbox/Files/DropboxFiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([ManualEntity]), DropboxModule],
  controllers: [ManualController],
  providers: [ManualService],
  exports: [ManualService],
})
export class ManualModule {}