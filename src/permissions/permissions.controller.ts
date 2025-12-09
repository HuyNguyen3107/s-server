import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { PERMISSION_PERMISSIONS } from './constants/permissions.constants';

@Controller('permissions')
@UseGuards(JwtGuard, PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Tạo quyền hạn mới
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.CREATE,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<{
    statusCode: number;
    message: string;
    data: PermissionResponseDto;
  }> {
    const permission =
      await this.permissionsService.create(createPermissionDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo quyền hạn thành công',
      data: permission,
    };
  }

  /**
   * Tạo nhiều quyền hạn cùng lúc
   */
  @Post('bulk')
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.CREATE,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async createMany(@Body() body: { names: string[] }): Promise<{
    statusCode: number;
    message: string;
    data: PermissionResponseDto[];
  }> {
    const permissions = await this.permissionsService.createMany(body.names);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo danh sách quyền hạn thành công',
      data: permissions,
    };
  }

  /**
   * Lấy danh sách quyền hạn với phân trang và tìm kiếm
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.LIST,
    PERMISSION_PERMISSIONS.VIEW,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async findAll(@Query() query: GetPermissionsQueryDto): Promise<{
    statusCode: number;
    message: string;
    data: PaginationResponseDto<PermissionResponseDto>;
  }> {
    const result = await this.permissionsService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách quyền hạn thành công',
      data: result,
    };
  }

  /**
   * Lấy thông tin chi tiết một quyền hạn
   */
  @Get(':id')
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.VIEW,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
    data: PermissionResponseDto;
  }> {
    const permission = await this.permissionsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin quyền hạn thành công',
      data: permission,
    };
  }

  /**
   * Lấy quyền hạn theo danh sách tên
   */
  @Post('by-names')
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.VIEW,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async findByNames(@Body() body: { names: string[] }): Promise<{
    statusCode: number;
    message: string;
    data: PermissionResponseDto[];
  }> {
    const permissions = await this.permissionsService.findByNames(body.names);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách quyền hạn theo tên thành công',
      data: permissions,
    };
  }

  /**
   * Cập nhật quyền hạn
   */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.UPDATE,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data: PermissionResponseDto;
  }> {
    const permission = await this.permissionsService.update(
      id,
      updatePermissionDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật quyền hạn thành công',
      data: permission,
    };
  }

  /**
   * Xóa quyền hạn
   */
  @Delete(':id')
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.DELETE,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
  }> {
    const result = await this.permissionsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  /**
   * Kiểm tra quyền hạn có tồn tại không
   */
  @Get(':id/exists')
  @RequireAnyPermission(
    PERMISSION_PERMISSIONS.VIEW,
    PERMISSION_PERMISSIONS.MANAGE,
  )
  async exists(@Param('id', ParseUUIDPipe) id: string): Promise<{
    statusCode: number;
    message: string;
    data: { exists: boolean };
  }> {
    const exists = await this.permissionsService.exists(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Kiểm tra quyền hạn thành công',
      data: { exists },
    };
  }
}
