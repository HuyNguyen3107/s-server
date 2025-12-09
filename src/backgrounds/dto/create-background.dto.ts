import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BackgroundConfigDto } from './background-config.dto';

export class CreateBackgroundDto {
  @IsUUID('4', { message: 'Product ID phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Tên background không được vượt quá 255 ký tự' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;

  @IsUrl({}, { message: 'URL hình ảnh không hợp lệ' })
  @IsNotEmpty({ message: 'URL hình ảnh không được để trống' })
  imageUrl: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackgroundConfigDto)
  config?: BackgroundConfigDto;
}
