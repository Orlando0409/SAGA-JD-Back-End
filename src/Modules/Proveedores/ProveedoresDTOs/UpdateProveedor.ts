import { PartialType } from '@nestjs/swagger';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './CreateProveedor';

export class UpdateProveedorFisicoDto extends PartialType(CreateProveedorFisicoDto) {}

export class UpdateProveedorJuridicoDto extends PartialType(CreateProveedorJuridicoDto) {}
