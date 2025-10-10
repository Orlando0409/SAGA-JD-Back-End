import { PartialType , OmitType } from '@nestjs/swagger';
import { CreateProveedorFisicoDto, CreateProveedorJuridicoDto } from './CreateProveedor.dto';

export class UpdateProveedorFisicoDto extends PartialType(
     OmitType(CreateProveedorFisicoDto, ['Id_Estado_Proveedor' , 'Identificacion', 'Tipo_Identificacion'] as const),) {}

export class UpdateProveedorJuridicoDto extends PartialType( 
    OmitType(CreateProveedorJuridicoDto, ['Id_Estado_Proveedor' , 'Cedula_Juridica'] as const),) {}
