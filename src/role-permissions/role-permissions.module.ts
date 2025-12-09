import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';

@Module({
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService, PrismaService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
