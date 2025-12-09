import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsArray({ message: 'roleIds must be an array' })
  @IsUUID(4, { each: true, message: 'Each roleId must be a valid UUID' })
  @IsNotEmpty({ message: 'roleIds is required' })
  roleIds: string[];
}
