import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsFileType(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isFileType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return (
            value &&
            typeof value === 'object' &&
            (typeof value.data === 'string' || typeof value.url === 'string')
          );
        },
        defaultMessage() {
          return 'must contain either "data" or "url".';
        },
      },
    });
  };
}
