import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutAuthDto {
  @IsString({ message: 'Access token phải là chuỗi' })
  @IsNotEmpty({ message: 'Access token không được để trống' })
  accessToken: string;

  @IsString({ message: 'Refresh token phải là chuỗi' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;
}
