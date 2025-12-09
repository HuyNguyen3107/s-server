import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFeedbacksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số trang phải là một số' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là một số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Đánh giá phải là một số' })
  @Min(1, { message: 'Đánh giá phải từ 1 đến 5' })
  rating?: number;
}
