import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { TipoIdentificacion } from '../../Common/Enums/TipoIdentificacion.enum';

export function IsIdentificacionValida(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsIdentificacionValida',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
            validate(value: any, args: ValidationArguments) {
            const tipo = (args.object as any).Tipo_Identificacion; // <-- accede al otro campo del DTO
                if (!value || !tipo) return false;

                const limpio = value.replace(/[\s\-]+/g, '');

                switch (tipo) {
                    case TipoIdentificacion.CEDULA:
                        return /^[1-7]\d{8}$/.test(limpio); // 9 dígitos CR
                    case TipoIdentificacion.DIMEX:
                        return /^(12|13|18)\d{9,10}$/.test(limpio); // 11 - 12 dígitos Dimex
                    case TipoIdentificacion.PASAPORTE:
                        return /^(?=.*[A-Z])(?=([A-Z]*[0-9]*){6,12}$)(?!.*[A-Z].*[A-Z].*[A-Z].*[A-Z])[A-Z0-9]{6,12}$/.test(limpio); // 6-12 caracteres alfanuméricos, al menos 1 letra, máximo 3 letras
                    case TipoIdentificacion.CEDULA_JURIDICA:
                        return /^[34]\d{9}$/.test(limpio);
                    default:
                        return false;
                }
            },
            defaultMessage(args: ValidationArguments) {
                switch ((args.object as any).Tipo_Identificacion) {
                    case TipoIdentificacion.CEDULA:
                        return `La cédula nacional debe tener 9 dígitos numéricos y no puede comenzar con 0`;
                    case TipoIdentificacion.DIMEX:
                        return `El DIMEX debe tener entre 11 y 12 dígitos numéricos y debe comenzar con 12, 13 o 18`;
                    case TipoIdentificacion.PASAPORTE:
                        return `El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos en mayúsculas, con al menos 1 letra y máximo 3 letras`;
                    case TipoIdentificacion.CEDULA_JURIDICA:
                        return `La cédula jurídica debe tener 10 dígitos y comenzar con 3 (nacional) o 4 (extranjera). Formatos válidos: 3-101-234567, 3--101--234567, 3 101 234567`;
                    default:
                        return `La identificación no es válida para el tipo seleccionado`;
                    }
                },
            }
        });
    };
}
