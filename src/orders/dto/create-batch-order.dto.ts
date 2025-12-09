import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO cho thông tin khách hàng trong batch order
export class BatchCustomerInfoDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO cho thông tin giao hàng trong batch order
export class BatchShippingInfoDto {
  @IsString()
  shippingId: string;

  @IsString()
  @IsOptional()
  shippingType?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsNumber()
  shippingFee: number;

  @IsString()
  @IsOptional()
  estimatedDeliveryTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  vtpCode?: string;
}

// DTO cho thông tin khuyến mãi trong batch order
export class BatchPromotionInfoDto {
  @IsString()
  promotionId: string;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsNumber()
  discountAmount: number;
}

// DTO cho từng item trong batch order
export class BatchOrderItemDto {
  @IsObject()
  product: {
    id: string;
    name?: string;
    hasBg?: boolean;
  };

  @IsObject()
  @IsOptional()
  variant?: {
    id: string;
    name?: string;
    description?: string;
    price: number;
    endow?: any;
    option?: any;
    config?: any;
  };

  @IsObject()
  @IsOptional()
  collection?: {
    id: string;
    name?: string;
    imageUrl?: string;
    routeName?: string;
  };

  @IsObject()
  @IsOptional()
  background?: {
    backgroundId: string;
    backgroundName?: string;
    backgroundDescription?: string;
    backgroundImageUrl?: string;
    backgroundPrice?: number;
    formConfig?: any;
    formData?: any;
  };

  @IsArray()
  @IsOptional()
  selectedOptions?: Array<{
    id: string;
    name?: string;
    description?: string;
    price: number;
  }>;

  @IsObject()
  @IsOptional()
  customQuantities?: Record<string, number>;

  @IsObject()
  @IsOptional()
  selectedCategoryProducts?: Record<
    string,
    {
      categoryId: string;
      categoryName?: string;
      products: Array<{
        productCustomId: string;
        productCustomName?: string;
        productCustomImage?: string;
        productCustomDescription?: string;
        quantity: number;
        price: number;
        totalPrice: number;
      }>;
    }
  >;

  @IsObject()
  @IsOptional()
  multiItemCustomizations?: Record<
    number,
    Record<
      string,
      {
        categoryId: string;
        categoryName?: string;
        products: Array<{
          productCustomId: string;
          productCustomName?: string;
          productCustomImage?: string;
          productCustomDescription?: string;
          quantity: number;
          price: number;
          totalPrice: number;
        }>;
      }
    >
  >;

  @IsObject()
  pricing: {
    productPrice: number;
    optionsPrice: number;
    customProductsPrice: number;
    backgroundPrice: number;
    itemSubtotal: number;
  };

  @IsObject()
  @IsOptional()
  metadata?: {
    orderSource?: string;
    userAgent?: string;
  };
}

// DTO cho pricing tổng của batch order
export class BatchPricingDto {
  @IsNumber()
  itemsSubtotal: number;

  @IsNumber()
  shippingFee: number;

  @IsNumber()
  discountAmount: number;

  @IsNumber()
  total: number;
}

// DTO chính cho batch order
export class CreateBatchOrderDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchOrderItemDto)
  items: BatchOrderItemDto[];

  @ValidateNested()
  @Type(() => BatchCustomerInfoDto)
  customerInfo: BatchCustomerInfoDto;

  @ValidateNested()
  @Type(() => BatchShippingInfoDto)
  shipping: BatchShippingInfoDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => BatchPromotionInfoDto)
  promotion?: BatchPromotionInfoDto;

  @ValidateNested()
  @Type(() => BatchPricingDto)
  pricing: BatchPricingDto;

  @IsObject()
  @IsOptional()
  metadata?: {
    orderSource?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}
