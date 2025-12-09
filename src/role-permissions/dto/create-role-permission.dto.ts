import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateRolePermissionDto {
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
