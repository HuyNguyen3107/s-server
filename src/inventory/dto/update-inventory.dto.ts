import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
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

export class StockAdjustmentDto {
  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReserveStockDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
