import { Expose } from "class-transformer";

export class GetFAQSimpleDTO {
    @Expose()
    Pregunta: string;

    @Expose()
    Respuesta: string;
}