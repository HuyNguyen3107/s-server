import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProductVariantDto extends PartialType(
  CreateProductVariantDto,
) {
  // Loại bỏ productId khỏi update DTO
  productId?: never;
}

export class UpdateProductVariantStatusDto {
  @IsString()
  @IsOptional()
  status: string;
}
