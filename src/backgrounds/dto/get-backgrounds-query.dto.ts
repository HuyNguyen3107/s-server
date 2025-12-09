import { IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBackgroundsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là một số nguyên' })
  @Min(1, { message: 'Trang phải lớn hơn 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là một số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  @Max(100, { message: 'Số lượng không được vượt quá 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Product ID phải là UUID hợp lệ' })
  productId?: string;
}
