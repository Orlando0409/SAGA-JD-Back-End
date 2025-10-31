import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, Patch, Request } from '@nestjs/common';
import { RequiereRoles } from 'src/Modules/auth/Decorator/Rol.decorator';
import { RolesService } from "../Services/roles.service";
import { CreateRolesDto } from "../UsuarioDTO's/CreateRoles.dto";
import { UpdateRolesDto } from "../UsuarioDTO's/UpdateRoles.dto";

@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService
    ) { }

    @Get('allRoles')
    AllRoles() {
        return this.rolesService.AllRoles();
    }

    @Get('allPermissions')
    AllPermission() {
        return this.rolesService.AllPermission();
    }

    @Get(':id')
    FindRoles(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOneRoles(id);
    }

    @Post()
    @RequiereRoles('Administrador')
    CreateRoles(
        @Body() createRolesDto: CreateRolesDto,
        @Request() req: any) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.rolesService.createRoles(createRolesDto, idUsuario);
    }

    @Put(':id')
    UpdateRoles(
        @Param('id') id: string,
        @Body() updateRolesDto: UpdateRolesDto,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.rolesService.updateRoles(+id, updateRolesDto, idUsuario);
    }

    @Patch('restore/:id')
    RestoreRoles(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.rolesService.restoreRole(id, idUsuario);
    }

    @Delete(':id')
    DeleteRoles(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        const idUsuario = req.user?.Id_Usuario ?? req.user?.id ?? null;
        return this.rolesService.softDeleteRol(id, idUsuario);
    }
}