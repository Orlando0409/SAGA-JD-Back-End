import { PartialType , OmitType } from '@nestjs/swagger';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './CreateProveedor';

export class UpdateProveedorFisicoDto extends PartialType(
     OmitType(CreateProveedorFisicoDto, ['Id_EstadoProveedor' , 'Cedula_Fisica'] as const),) {}

export class UpdateProveedorJuridicoDto extends PartialType( 
    OmitType(CreateProveedorJuridicoDto, ['Id_EstadoProveedor' , 'Cedula_Juridica'] as const),) {}
