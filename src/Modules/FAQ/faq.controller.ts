import { Controller, Post, Body, UseGuards, Request, Get, Param, Put, Delete, ParseIntPipe, Patch, } from '@nestjs/common';
import { FAQService } from './faq.service';
import { CreateFAQDto } from './DTOs/CreateFAQ.dto';
import { UpdateFAQDto } from './DTOs/UpdateFAQ.dto';
import { JwtAuthGuard } from '../auth/Guard/JwtGuard';
import { Public } from "src/Modules/auth/Decorator/Public.decorator";

@Controller('faq')
export class FAQController {
    constructor(
        private readonly faqService: FAQService
    ) { }

    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    @Get('admin')
    async findAllAdmin() {
        return this.faqService.findAllAdmin();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateFAQDto,
        @Request() req: any,
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.faqService.update(id, updateDto, idUsuario);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.remove(id);
    }
}
