import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateRangeValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateRangeValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const obj = args.object as { from?: string; to?: string };
          if (!obj.from || !obj.to) {
            return true;
          }
          return obj.from <= obj.to;
        },
        defaultMessage() {
          return 'Дата «от» не может быть позже даты «до»';
        },
      },
    });
  };
}
