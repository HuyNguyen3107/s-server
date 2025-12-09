import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePromotionDto {
  @IsString()
  @IsNotEmpty()
  promoCode: string;

  @IsNotEmpty()
  orderValue: number;
}

export class PromotionValidationResult {
  isValid: boolean;
  promotion?: any;
  discountAmount?: number;
  error?: string;
}
