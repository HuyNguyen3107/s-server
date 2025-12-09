import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  IsDecimal,
  IsObject,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { validateEndowSystem } from '../utils/endow.utils';

// Custom validator cho endow
function IsValidEndow(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isValidEndow',
      validator: {
        validate: (value: any) => {
          return validateEndowSystem(value);
        },
        defaultMessage: () => 'Endow data is not valid',
      },
    },
    validationOptions,
  );
}

export class CreateProductVariantDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsOptional()
  @IsValidEndow()
  endow?: any; // Có thể là string (legacy) hoặc EndowSystem object

  @IsObject()
  @IsOptional()
  option?: any;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsString()
  @IsOptional()
  status?: string;
}
