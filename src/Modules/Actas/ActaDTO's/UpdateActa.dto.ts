import { PartialType } from "@nestjs/swagger";
import { CreateActaDto } from "./CreateActa.dto";
import { IsArray, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional} from "@nestjs/swagger";
import {Transform} from "class-transformer";

export class UpdateActaDto extends PartialType(CreateActaDto) {

    @ApiPropertyOptional({
        example: [1, 3],
        type: [Number],
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch { return []; }
        }
        return Array.isArray(value) ? value.map(Number) : [];
    })
    ArchivosAEliminar?: number[];
}