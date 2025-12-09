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
import { RolesService } from './roles.service';
import { RoleUtilsService } from './role-utils.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../permissions/constants/permissions.constants';

@Controller('roles')
@UseGuards(JwtGuard, PermissionGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly roleUtilsService: RoleUtilsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireAnyPermission(ROLE_PERMISSIONS.CREATE, ROLE_PERMISSIONS.MANAGE)
  create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequireAnyPermission(
    ROLE_PERMISSIONS.LIST,
    ROLE_PERMISSIONS.VIEW,
    ROLE_PERMISSIONS.MANAGE,
  )
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('statistics')
  @RequireAnyPermission(ROLE_PERMISSIONS.VIEW, ROLE_PERMISSIONS.MANAGE)
  async getStatistics() {
    const stats = await this.roleUtilsService.getRoleStatistics();
    return {
      success: true,
      message: 'Lấy thống kê vai trò thành công',
      data: stats,
    };
  }

  @Get('compare/:roleId1/:roleId2')
  @RequireAnyPermission(ROLE_PERMISSIONS.VIEW, ROLE_PERMISSIONS.MANAGE)
  async compareRoles(
    @Param('roleId1', ParseUUIDPipe) roleId1: string,
    @Param('roleId2', ParseUUIDPipe) roleId2: string,
  ) {
    const comparison = await this.roleUtilsService.compareRolePermissions(
      roleId1,
      roleId2,
    );
    return {
      success: true,
      message: 'So sánh vai trò thành công',
      data: comparison,
    };
  }

  @Get('users-without-roles')
  @RequireAnyPermission(ROLE_PERMISSIONS.VIEW, ROLE_PERMISSIONS.MANAGE)
  async getUsersWithoutRoles() {
    const result = await this.roleUtilsService.getUsersWithoutRoles();
    return {
      success: true,
      message: 'Lấy danh sách users chưa có vai trò thành công',
      data: result,
    };
  }

  @Get(':id')
  @RequireAnyPermission(ROLE_PERMISSIONS.VIEW, ROLE_PERMISSIONS.MANAGE)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(ROLE_PERMISSIONS.UPDATE, ROLE_PERMISSIONS.MANAGE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireAnyPermission(ROLE_PERMISSIONS.DELETE, ROLE_PERMISSIONS.MANAGE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
