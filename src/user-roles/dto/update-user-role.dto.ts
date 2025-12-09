import { IsOptional, IsUUID } from 'class-validator';

export class UpdateUserRoleDto {
  @IsOptional()
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  userId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'roleId must be a valid UUID' })
  roleId?: string;
}
