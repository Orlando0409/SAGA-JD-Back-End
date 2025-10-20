import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, Patch } from '@nestjs/common';
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

    @Post(':idUsuario')
    @RequiereRoles('Administrador')
    CreateRoles(@Param('idUsuario', ParseIntPipe) idUsuario: number, @Body() createRolesDto: CreateRolesDto) {
        return this.rolesService.createRoles(createRolesDto, idUsuario);
    }

    @Put(':id/:idUsuario')
    UpdateRoles(@Param('id') id: string, @Body() updateRolesDto: UpdateRolesDto, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
        return this.rolesService.updateRoles(+id, updateRolesDto, idUsuario);
    }

    @Patch('restore/:id/:idUsuario')
    RestoreRoles(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
        return this.rolesService.restoreRole(id, idUsuario);
    }

    @Delete(':id/:idUsuario')
    DeleteRoles(@Param('id', ParseIntPipe) id: number, @Param('idUsuario', ParseIntPipe) idUsuario: number) {
        return this.rolesService.softDeleteRol(id, idUsuario);
    }
}