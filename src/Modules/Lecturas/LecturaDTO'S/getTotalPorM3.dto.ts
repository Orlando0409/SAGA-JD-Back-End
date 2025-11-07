import { ApiProperty } from "@nestjs/swagger";

export class getTotalPorM3DTO {
    @ApiProperty({ example: 28 })
    Metros_Cubicos: number;
}