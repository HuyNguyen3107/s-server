import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsNumber,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Collection info
export class CollectionInfoDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  routeName?: string;
}

// Product info
export class ProductInfoDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  hasBg?: boolean;
}

// Variant info
export class VariantInfoDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  endow?: any;

  @IsOptional()
  option?: any;

  @IsOptional()
  config?: any;
}

// Selected option
export class SelectedOptionDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

// Product custom item
export class ProductCustomItemDto {
  @IsNotEmpty()
  @IsString()
  productCustomId: string;

  @IsOptional()
  @IsString()
  productCustomName?: string;

  @IsOptional()
  @IsString()
  productCustomImage?: string;

  @IsOptional()
  @IsString()
  productCustomDescription?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}

// Category products
export class CategoryProductsDto {
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCustomItemDto)
  products: ProductCustomItemDto[];
}

// Background form field config
export class BackgroundFormFieldConfigDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  validation?: any;

  @IsOptional()
  @IsArray()
  options?: Array<{
    label: string;
    value: string;
  }>;
}

// Background form config
export class BackgroundFormConfigDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BackgroundFormFieldConfigDto)
  fields: BackgroundFormFieldConfigDto[];
}

// Background form field value (dữ liệu khách hàng nhập)
export class BackgroundFormFieldValueDto {
  @IsNotEmpty()
  @IsString()
  fieldId: string;

  @IsNotEmpty()
  @IsString()
  fieldTitle: string;

  @IsNotEmpty()
  @IsString()
  fieldType: string;

  @IsNotEmpty()
  value: any;

  @IsOptional()
  @IsString()
  otherValue?: string;
}

// Background form data (dữ liệu khách hàng đã nhập)
export class BackgroundFormDataDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BackgroundFormFieldValueDto)
  values: BackgroundFormFieldValueDto[];
}

// Background info
export class BackgroundInfoDto {
  @IsNotEmpty()
  @IsString()
  backgroundId: string;

  @IsOptional()
  @IsString()
  backgroundName?: string;

  @IsOptional()
  @IsString()
  backgroundDescription?: string;

  @IsOptional()
  @IsString()
  backgroundImageUrl?: string;

  @IsOptional()
  @IsNumber()
  backgroundPrice?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackgroundFormConfigDto)
  formConfig?: BackgroundFormConfigDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BackgroundFormDataDto)
  formData: BackgroundFormDataDto;
}

// Shipping info
export class ShippingInfoDto {
  @IsNotEmpty()
  @IsString()
  shippingId: string;

  @IsOptional()
  @IsString()
  shippingType?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string;

  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Promotion info
export class PromotionInfoDto {
  @IsNotEmpty()
  @IsString()
  promotionId: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;
}

// Pricing info
export class PricingInfoDto {
  @IsNotEmpty()
  @IsNumber()
  productPrice: number;

  @IsNotEmpty()
  @IsNumber()
  optionsPrice: number;

  @IsNotEmpty()
  @IsNumber()
  customProductsPrice: number;

  @IsNotEmpty()
  @IsNumber()
  backgroundPrice: number;

  @IsNotEmpty()
  @IsNumber()
  subtotal: number;

  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

// Main order data
export class OrderDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CollectionInfoDto)
  collection?: CollectionInfoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProductInfoDto)
  product: ProductInfoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VariantInfoDto)
  variant: VariantInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedOptionDto)
  selectedOptions?: SelectedOptionDto[];

  @IsOptional()
  @IsObject()
  customQuantities?: Record<string, number>;

  @IsOptional()
  @IsObject()
  selectedCategoryProducts?: Record<string, CategoryProductsDto>;

  @IsOptional()
  @IsObject()
  multiItemCustomizations?: Record<number, Record<string, CategoryProductsDto>>;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackgroundInfoDto)
  background?: BackgroundInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shipping?: ShippingInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionInfoDto)
  promotion?: PromotionInfoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PricingInfoDto)
  pricing: PricingInfoDto;

  @IsOptional()
  @IsObject()
  metadata?: {
    orderSource?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

// Main CreateOrderDto
export class CreateOrderDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OrderDataDto)
  orderData: OrderDataDto;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
