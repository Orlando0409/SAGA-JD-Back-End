import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsCedulaJuridicaValida(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCedulaJuridicaValida',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Normalizar removiendo guiones
          const normalizedValue = value.replace(/-/g, '');

          // Validar que solo contenga dígitos después de la normalización
          if (!/^\d+$/.test(normalizedValue)) return false;

          // Validar formato de cédula jurídica costarricense (10 dígitos, empezar con 2, 3, 4 o 5)
          const cedulaJuridicaRegex = /^[2345]\d{9}$/;
          const isValid = cedulaJuridicaRegex.test(normalizedValue);

          // Actualizar el valor en el objeto solo si es válido
          if (isValid) {
            (args.object as any)[propertyName] = normalizedValue;
          }

          return isValid;
        },
        defaultMessage(args: ValidationArguments) {
          return 'La cédula jurídica debe tener exactamente 10 dígitos numéricos, comenzar con 2, 3, 4 o 5, y puede incluir guiones que serán removidos automáticamente';
        },
      },
    });
  };
}

// Decorator alternativo usando Transform para la normalización
export function NormalizeCedulaJuridica() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.replace(/-/g, '');
    }
    return value;
  });
}
