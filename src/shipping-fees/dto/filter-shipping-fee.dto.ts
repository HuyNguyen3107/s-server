import { IsOptional, IsString, IsIn, Min, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterShippingFeeDto {
  @IsOptional()
  @IsString({ message: 'Loại vận chuyển phải là chuỗi' })
  shippingType?: string;

  @IsOptional()
  @IsString({ message: 'Khu vực phải là chuỗi' })
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Trang phải là số' })
  @Min(1, { message: 'Trang phải lớn hơn 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng mỗi trang phải là số' })
  @Min(1, { message: 'Số lượng mỗi trang phải lớn hơn 0' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Thứ tự sắp xếp phải là asc hoặc desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  @IsIn(['shippingFee', 'createdAt', 'area'], {
    message: 'Trường sắp xếp không hợp lệ',
  })
  sortBy?: 'shippingFee' | 'createdAt' | 'area' = 'createdAt';
}
