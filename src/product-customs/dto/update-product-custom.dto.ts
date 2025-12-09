import { PartialType } from '@nestjs/mapped-types';
import { CreateProductCustomDto } from './create-product-custom.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProductCustomDto extends PartialType(
  CreateProductCustomDto,
) {
  @IsUUID()
  @IsOptional()
  productCategoryId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
