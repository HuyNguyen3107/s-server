import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProductCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
