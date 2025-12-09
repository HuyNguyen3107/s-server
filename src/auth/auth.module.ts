import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtGuard } from './guards/jwt.guard';
import { JwtMiddleware } from './middleware/jwt.middleware';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, JwtMiddleware, PermissionGuard],
  exports: [AuthService, JwtGuard, JwtMiddleware, PermissionGuard],
})
export class AuthModule {}
