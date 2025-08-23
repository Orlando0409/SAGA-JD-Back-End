import { IsEmail,IsDefined,IsString, MinLength} from "class-validator";
import { Transform } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";

export class LoginDTO{


    @ApiProperty({
    example: 'correo@gmail.com'
   })
    @IsEmail()
    @IsDefined({message: 'El correo no puede estar vacio'})
    Correo_Electronico : string;

    
    @ApiProperty({
        example: '123456'
       })
    @IsString()
    @MinLength(6)
    @Transform(({value})=> value.trim())
    Contraseña : string;
}