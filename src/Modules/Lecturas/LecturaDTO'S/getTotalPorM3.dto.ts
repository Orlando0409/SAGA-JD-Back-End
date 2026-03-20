import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsPositive } from "class-validator";

export class getTotalPorM3DTO {
    @ApiProperty({ example: 28 })
    @IsDefined({ message: 'Los metros cúbicos no pueden estar vacios' })
    @IsPositive({ message: 'Los metros cúbicos deben ser un número positivo mayor que cero' })
    Metros_Cubicos: number;
}