import { IsString, IsNotEmpty, Validate } from 'class-validator';
import { IsValidOrderStatus } from '../validators/order-status.validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsValidOrderStatus)
  status: string;
}
