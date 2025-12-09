import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDecimal,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateProductCustomDto {
  @IsUUID()
  @IsNotEmpty()
  productCategoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value !== null && value !== undefined ? parseFloat(value) : undefined,
  )
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
