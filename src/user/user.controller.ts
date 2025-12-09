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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  JwtGuard,
  GetUser,
  UserPayload,
  PermissionGuard,
  RequirePermissions,
  RequireAnyPermission,
} from '../auth';
import { USER_PERMISSIONS } from '../permissions/constants/permissions.constants';

@Controller('user')
@UseGuards(JwtGuard, PermissionGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequireAnyPermission(USER_PERMISSIONS.CREATE, USER_PERMISSIONS.MANAGE)
  create(@Body() createUserDto: CreateUserDto, @GetUser() user: UserPayload) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequireAnyPermission(
    USER_PERMISSIONS.LIST,
    USER_PERMISSIONS.VIEW,
    USER_PERMISSIONS.MANAGE,
  )
  findAll(
    @GetUser() user: UserPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.findAll(page, limit, search);
  }

  @Get('profile')
  // Không cần quyền đặc biệt - user xem profile của chính mình
  getProfile(@GetUser() user: UserPayload) {
    return {
      message: 'User profile retrieved successfully',
      data: user,
    };
  }

  @Get(':id')
  @RequireAnyPermission(USER_PERMISSIONS.VIEW, USER_PERMISSIONS.MANAGE)
  findOne(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.userService.findOne(id);
  }

  @Get(':id/roles')
  @RequireAnyPermission(USER_PERMISSIONS.VIEW, USER_PERMISSIONS.MANAGE)
  getUserRoles(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.userService.getUserRoles(id);
  }

  @Patch(':id')
  @RequireAnyPermission(USER_PERMISSIONS.UPDATE, USER_PERMISSIONS.MANAGE)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: UserPayload,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequireAnyPermission(USER_PERMISSIONS.DELETE, USER_PERMISSIONS.MANAGE)
  remove(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.userService.remove(id);
  }
}
