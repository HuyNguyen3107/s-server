import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsOptional()
  @IsString({ message: 'Tên quyền hạn phải là chuỗi' })
  @MaxLength(100, { message: 'Tên quyền hạn không được quá 100 ký tự' })
  name?: string;
}
