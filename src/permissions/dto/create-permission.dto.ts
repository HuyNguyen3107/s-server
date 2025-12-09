import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Tên quyền hạn không được để trống' })
  @IsString({ message: 'Tên quyền hạn phải là chuỗi' })
  @MaxLength(100, { message: 'Tên quyền hạn không được quá 100 ký tự' })
  name: string;
}
