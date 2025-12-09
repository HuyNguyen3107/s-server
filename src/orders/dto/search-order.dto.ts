import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SearchOrderDto {
  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
