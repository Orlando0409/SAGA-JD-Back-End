import {Controller , Get, Post, Body, Param, Delete, Put, ParseIntPipe} from '@nestjs/common';
import {RolesService} from "./roles.service";
import {CreateRolesDto} from "./RolesDTO's/CreateRoles.dto";
import {UpdateRolesDto} from "./RolesDTO's/UpdateRoles.dto";

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}
    
    @Get()
    AllRoles() {
        return this.rolesService.AllRoles();
    }
    
    @Get(':id')
    FindRoles(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOneRoles(id);
    }
    
    @Post()
    CreateRoles(@Body() createRolesDto: CreateRolesDto) {
        return this.rolesService.createRoles(createRolesDto);
    }
    
    @Put(':id')
    UpdateRoles(@Param('id') id: string, @Body() updateRolesDto: UpdateRolesDto) {
        return this.rolesService.updateRoles(+id, updateRolesDto);
    }
    
    @Delete(':id')
    DeleteRoles(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.deleteRoles(id);
    }
    }