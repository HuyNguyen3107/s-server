import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from './roles.service';
import { RoleUtilsService } from './role-utils.service';
import { RolesController } from './roles.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleUtilsService, PrismaService],
  exports: [RolesService, RoleUtilsService],
})
export class RolesModule {}
