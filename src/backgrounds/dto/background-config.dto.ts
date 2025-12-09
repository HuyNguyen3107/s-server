import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUrl,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTOs for Background Configuration
 */

export enum FieldType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  SELECT = 'select',
  DATE = 'date',
  IMAGE_UPLOAD = 'image_upload',
}

// Select option DTO
export class SelectOptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

// Base field configuration DTO
export class BaseFieldConfigDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(FieldType)
  type: FieldType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  required: boolean;

  @IsNumber()
  @Min(0)
  order: number;
}

// Short text field DTO
export class ShortTextFieldDto extends BaseFieldConfigDto {
  @IsEnum(FieldType)
  type: FieldType.SHORT_TEXT;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxLength?: number;

  @IsString()
  @IsOptional()
  defaultValue?: string;
}

// Long text field DTO
export class LongTextFieldDto extends BaseFieldConfigDto {
  @IsEnum(FieldType)
  type: FieldType.LONG_TEXT;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxLength?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  rows?: number;

  @IsString()
  @IsOptional()
  defaultValue?: string;
}

// Select field DTO
export class SelectFieldDto extends BaseFieldConfigDto {
  @IsEnum(FieldType)
  type: FieldType.SELECT;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectOptionDto)
  options: SelectOptionDto[];

  @IsBoolean()
  allowOther: boolean;

  @IsString()
  @IsOptional()
  otherPlaceholder?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;
}

// Date field DTO
export class DateFieldDto extends BaseFieldConfigDto {
  @IsEnum(FieldType)
  type: FieldType.DATE;

  @IsString()
  @IsOptional()
  minDate?: string;

  @IsString()
  @IsOptional()
  maxDate?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;
}

// Image upload field DTO
export class ImageUploadFieldDto extends BaseFieldConfigDto {
  @IsEnum(FieldType)
  type: FieldType.IMAGE_UPLOAD;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxFiles?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxFileSize?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  allowedFormats?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  minFiles?: number;
}

// Metadata DTO
export class ConfigMetadataDto {
  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}

// Main background config DTO
export class BackgroundConfigDto {
  @IsString()
  @IsNotEmpty()
  version: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseFieldConfigDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ShortTextFieldDto, name: FieldType.SHORT_TEXT },
        { value: LongTextFieldDto, name: FieldType.LONG_TEXT },
        { value: SelectFieldDto, name: FieldType.SELECT },
        { value: DateFieldDto, name: FieldType.DATE },
        { value: ImageUploadFieldDto, name: FieldType.IMAGE_UPLOAD },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  fields: Array<
    | ShortTextFieldDto
    | LongTextFieldDto
    | SelectFieldDto
    | DateFieldDto
    | ImageUploadFieldDto
  >;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfigMetadataDto)
  metadata?: ConfigMetadataDto;
}
