import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function IsTelefonoValido(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTelefonoValido',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          try {
            const phoneNumber = parsePhoneNumberFromString(value);
            return !!(phoneNumber && phoneNumber.isValid());
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'El número de teléfono no es válido';
        },
      },
    });
  };
}
