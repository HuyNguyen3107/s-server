import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignOrderDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
