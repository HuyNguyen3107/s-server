import { IsNotEmpty, IsEmail } from 'class-validator';

export class TransferOrderDto {
  @IsNotEmpty()
  @IsEmail()
  targetUserEmail: string;
}
