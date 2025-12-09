import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { RoleUtilsService } from '../roles/role-utils.service';
import { IsArray, IsString, IsUUID } from 'class-validator';

class CheckPermissionsDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

class CheckRolesDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];
}

@Controller('user-permissions')
export class UserPermissionsController {
  constructor(private readonly roleUtilsService: RoleUtilsService) {}

  @Get('user/:userId/permissions')
  async getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    const permissions = await this.roleUtilsService.getUserPermissions(userId);
    return {
      success: true,
      message: 'Lấy danh sách quyền của user thành công',
      data: {
        userId,
        permissions,
        permissionCount: permissions.length,
      },
    };
  }

  @Get('user/:userId/roles')
  async getUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    const result = await this.roleUtilsService.getUserRolesWithUserInfo(userId);
    return {
      success: true,
      message: 'Lấy danh sách vai trò của user thành công',
      data: result,
    };
  }

  @Get('user/:userId/permission/:permission')
  async checkUserPermission(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('permission') permission: string,
  ) {
    const hasPermission = await this.roleUtilsService.userHasPermission(
      userId,
      permission,
    );
    return {
      success: true,
      message: 'Kiểm tra quyền thành công',
      data: {
        userId,
        permission,
        hasPermission,
      },
    };
  }

  @Get('user/:userId/role/:role')
  async checkUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: string,
  ) {
    const hasRole = await this.roleUtilsService.userHasRole(userId, role);
    return {
      success: true,
      message: 'Kiểm tra vai trò thành công',
      data: {
        userId,
        role,
        hasRole,
      },
    };
  }

  @Post('check-permissions')
  async checkMultiplePermissions(
    @Body(ValidationPipe) checkDto: CheckPermissionsDto,
  ) {
    const { userId, permissions } = checkDto;

    const results = await Promise.all(
      permissions.map(async (permission) => {
        const hasPermission = await this.roleUtilsService.userHasPermission(
          userId,
          permission,
        );
        return {
          permission,
          hasPermission,
        };
      }),
    );

    const hasAllPermissions = results.every((r) => r.hasPermission);
    const hasAnyPermission = results.some((r) => r.hasPermission);

    return {
      success: true,
      message: 'Kiểm tra nhiều quyền thành công',
      data: {
        userId,
        results,
        summary: {
          totalChecked: permissions.length,
          hasAllPermissions,
          hasAnyPermission,
          permissionCount: results.filter((r) => r.hasPermission).length,
        },
      },
    };
  }

  @Post('check-roles')
  async checkMultipleRoles(@Body(ValidationPipe) checkDto: CheckRolesDto) {
    const { userId, roles } = checkDto;

    const results = await Promise.all(
      roles.map(async (role) => {
        const hasRole = await this.roleUtilsService.userHasRole(userId, role);
        return {
          role,
          hasRole,
        };
      }),
    );

    const hasAllRoles = results.every((r) => r.hasRole);
    const hasAnyRole = results.some((r) => r.hasRole);

    return {
      success: true,
      message: 'Kiểm tra nhiều vai trò thành công',
      data: {
        userId,
        results,
        summary: {
          totalChecked: roles.length,
          hasAllRoles,
          hasAnyRole,
          roleCount: results.filter((r) => r.hasRole).length,
        },
      },
    };
  }
}
