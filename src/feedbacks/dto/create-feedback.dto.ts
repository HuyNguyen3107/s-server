import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
  @MaxLength(100, { message: 'Tên khách hàng không được vượt quá 100 ký tự' })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung feedback không được để trống' })
  @MaxLength(1000, {
    message: 'Nội dung feedback không được vượt quá 1000 ký tự',
  })
  content: string;

  @IsUrl({}, { message: 'URL hình ảnh không hợp lệ' })
  @IsNotEmpty({ message: 'URL hình ảnh không được để trống' })
  imageUrl: string;

  @IsInt({ message: 'Đánh giá phải là một số nguyên' })
  @Min(1, { message: 'Đánh giá phải từ 1 đến 5 sao' })
  @Max(5, { message: 'Đánh giá phải từ 1 đến 5 sao' })
  rating: number;
}
