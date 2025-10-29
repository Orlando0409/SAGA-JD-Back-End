import { Controller, Post, Body, UseGuards, Request, Get, Param, Put, Delete, ParseIntPipe, Patch, } from '@nestjs/common';
import { FAQService } from './faq.service';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";
import { ApiTags } from '@nestjs/swagger';
import { CreateFAQDto } from './FAQDTO\'s/CreateFAQ.dto';
import { UpdateFAQDto } from './FAQDTO\'s/UpdateFAQ.dto';

@Controller('faq')
@ApiTags('FAQ')
@UseGuards(JwtAuthGuard)
export class FAQController {
    constructor(
        private readonly faqService: FAQService
    ) { }

    @Patch(':id/visible')
    async toggleVisible(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.faqService.toggleVisible(id, idUsuario);
    }

    @Post()
    async create(@Body() createDto: CreateFAQDto, @Request() req: any) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.faqService.create(createDto, idUsuario);
    }

    @Public()
    @Get()
    async findAll() {
        return this.faqService.findAll();
    }

    // get del admin 
    @Get('admin')
    async findAllAdmin() {
        return this.faqService.findAllAdmin();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateFAQDto,
        @Request() req: any,
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.faqService.update(id, updateDto, idUsuario);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.faqService.remove(id, idUsuario);
    }
}
