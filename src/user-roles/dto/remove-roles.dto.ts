import { IsArray, IsUUID } from 'class-validator';

export class RemoveRolesDto {
  @IsArray({ message: 'roleIds must be an array' })
  @IsUUID(4, { each: true, message: 'Each roleId must be a valid UUID' })
  roleIds: string[];
}
