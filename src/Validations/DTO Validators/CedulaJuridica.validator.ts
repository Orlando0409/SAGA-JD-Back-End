import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsCedulaJuridicaValida(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsCedulaJuridicaValida',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!value) return false;
                
                    const cedulaLimpia = value.toString().replace(/[\s\-]+/g, '');
                    
                    const cedulaJuridicaRegex = /^[34]\d{9}$/;
                    
                    return cedulaJuridicaRegex.test(cedulaLimpia);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'La cédula jurídica debe tener 10 dígitos y comenzar con 3 (nacional) o 4 (extranjera). Formatos válidos: 3-101-123456, 3--101--123456, 3 101 123456';
                },
            }
        });
    };
}