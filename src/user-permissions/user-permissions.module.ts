import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { UserPermissionsController } from './user-permissions.controller';

@Module({
  imports: [RolesModule],
  controllers: [UserPermissionsController],
})
export class UserPermissionsModule {}
