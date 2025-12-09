import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { RemoveRolesDto } from './dto/remove-roles.dto';
import {
  JwtGuard,
  GetUser,
  UserPayload,
  PermissionGuard,
  RequireAnyPermission,
} from '../auth';
import { USER_ROLE_PERMISSIONS } from '../permissions/constants/permissions.constants';

@Controller('user-roles')
@UseGuards(JwtGuard, PermissionGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.ASSIGN,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  create(
    @Body() createUserRoleDto: CreateUserRoleDto,
    @GetUser() user: UserPayload,
  ) {
    return this.userRolesService.create(createUserRoleDto);
  }

  @Post('assign')
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.ASSIGN,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  assignRoles(
    @Body() assignRolesDto: AssignRolesDto,
    @GetUser() user: UserPayload,
  ) {
    return this.userRolesService.assignRoles(assignRolesDto);
  }

  @Get()
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.VIEW,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  findAll(
    @GetUser() user: UserPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('userId') userId?: string,
    @Query('roleId') roleId?: string,
  ) {
    return this.userRolesService.findAll(page, limit, userId, roleId);
  }

  @Get('role/:roleId/users')
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.VIEW,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  getUsersByRole(
    @Param('roleId') roleId: string,
    @GetUser() user: UserPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userRolesService.getUsersByRole(roleId, page, limit);
  }

  @Get(':id')
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.VIEW,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  findOne(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.userRolesService.findOne(id);
  }

  @Patch(':id')
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.ASSIGN,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @GetUser() user: UserPayload,
  ) {
    return this.userRolesService.update(id, updateUserRoleDto);
  }

  @Delete(':id')
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.REVOKE,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  remove(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.userRolesService.remove(id);
  }

  @Delete('user/:userId/roles')
  @RequireAnyPermission(
    USER_ROLE_PERMISSIONS.REVOKE,
    USER_ROLE_PERMISSIONS.MANAGE,
  )
  removeRolesFromUser(
    @Param('userId') userId: string,
    @Body() removeRolesDto: RemoveRolesDto,
    @GetUser() user: UserPayload,
  ) {
    return this.userRolesService.removeRolesFromUser(userId, removeRolesDto);
  }
}
