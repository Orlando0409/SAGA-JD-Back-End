import {Body,Controller,Delete,Get,Param,ParseIntPipe,Post,UploadedFile,UseInterceptors} from '@nestjs/common';
import { ManualService } from './manual.service';
import { CreateManualDto } from './ManualDTO\'s/createManual.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('manual')
export class ManualController {
    constructor(private readonly manualService: ManualService) { }

    @Get()
    getManuales() 
    {
        return this.manualService.getManuales();
    }

    @Post()
    @UseInterceptors(FileInterceptor('PDF_Manual'))
    createManual(
        @Body() createManualDto: CreateManualDto,
        @UploadedFile() PDF_Manual: Express.Multer.File,
    ) {
        return this.manualService.createManual(createManualDto, PDF_Manual);
    }

    @Delete(':id')
    deleteManual(@Param('id', ParseIntPipe) id: number) {
        return this.manualService.deleteManual(id);
    }
}