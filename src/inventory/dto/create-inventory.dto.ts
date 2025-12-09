import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  productCustomId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reservedStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
