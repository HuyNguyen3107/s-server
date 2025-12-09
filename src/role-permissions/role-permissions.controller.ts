import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-to-role.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { ROLE_PERMISSION_PERMISSIONS } from '../permissions/constants/permissions.constants';

@Controller('role-permissions')
@UseGuards(JwtGuard, PermissionGuard)
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.ASSIGN,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  create(
    @Body(ValidationPipe) createRolePermissionDto: CreateRolePermissionDto,
  ) {
    return this.rolePermissionsService.create(createRolePermissionDto);
  }

  @Post('assign/:roleId')
  @HttpCode(HttpStatus.OK)
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.ASSIGN,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  assignPermissionsToRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body(ValidationPipe) assignDto: AssignPermissionsToRoleDto,
  ) {
    return this.rolePermissionsService.assignPermissionsToRole(
      roleId,
      assignDto,
    );
  }

  @Get()
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.VIEW,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  findAll() {
    return this.rolePermissionsService.findAll();
  }

  @Get('role/:roleId')
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.VIEW,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  findRolePermissions(@Param('roleId', ParseUUIDPipe) roleId: string) {
    return this.rolePermissionsService.findRolePermissions(roleId);
  }

  @Get(':id')
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.VIEW,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolePermissionsService.findOne(id);
  }

  @Delete('role/:roleId/permission/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.REVOKE,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  removePermissionFromRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolePermissionsService.removePermissionFromRole(
      roleId,
      permissionId,
    );
  }

  @Patch(':id')
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.ASSIGN,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    return this.rolePermissionsService.update(id, updateRolePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireAnyPermission(
    ROLE_PERMISSION_PERMISSIONS.REVOKE,
    ROLE_PERMISSION_PERMISSIONS.MANAGE,
  )
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolePermissionsService.remove(id);
  }
}
