import {
  IsNotEmpty,
  IsString,
  IsDecimal,
  IsOptional,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateShippingFeeDto {
  @IsNotEmpty({ message: 'Loại vận chuyển không được để trống' })
  @IsString({ message: 'Loại vận chuyển phải là chuỗi' })
  shippingType: string;

  @IsNotEmpty({ message: 'Khu vực không được để trống' })
  @IsString({ message: 'Khu vực phải là chuỗi' })
  area: string;

  @IsNotEmpty({ message: 'Thời gian giao hàng dự kiến không được để trống' })
  @IsString({ message: 'Thời gian giao hàng dự kiến phải là chuỗi' })
  estimatedDeliveryTime: string;

  @IsNotEmpty({ message: 'Phí vận chuyển không được để trống' })
  @Transform(({ value }) => Number(value))
  @Min(0, { message: 'Phí vận chuyển phải lớn hơn hoặc bằng 0' })
  shippingFee: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  notesOrRemarks?: string;
}
