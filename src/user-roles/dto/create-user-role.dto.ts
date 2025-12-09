import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserRoleDto {
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsUUID(4, { message: 'roleId must be a valid UUID' })
  @IsNotEmpty({ message: 'roleId is required' })
  roleId: string;
}
