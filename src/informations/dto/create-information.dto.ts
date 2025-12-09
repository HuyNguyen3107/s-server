import { IsNotEmpty, IsObject } from 'class-validator';

export class CreateInformationDto {
  @IsNotEmpty({ message: 'Config không được để trống' })
  @IsObject({ message: 'Config phải là một object' })
  config: Record<string, any>;
}
