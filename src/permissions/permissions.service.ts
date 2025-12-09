import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionsQueryDto } from './dto/get-permissions-query.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo quyền hạn mới
   */
  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    try {
      // Kiểm tra xem permission đã tồn tại chưa
      const existingPermission = await this.prisma.permission.findUnique({
        where: { name: createPermissionDto.name },
      });

      if (existingPermission) {
        throw new ConflictException(
          `Quyền hạn với tên '${createPermissionDto.name}' đã tồn tại`,
        );
      }

      // Tạo permission mới
      const permission = await this.prisma.permission.create({
        data: {
          name: createPermissionDto.name.toUpperCase().trim(),
        },
      });

      return new PermissionResponseDto(permission);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo quyền hạn');
    }
  }

  /**
   * Lấy danh sách quyền hạn với phân trang và tìm kiếm
   */
  async findAll(
    query: GetPermissionsQueryDto,
  ): Promise<PaginationResponseDto<PermissionResponseDto>> {
    try {
      const { search, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      // Điều kiện tìm kiếm
      const whereCondition = search
        ? {
            name: {
              contains: search.toUpperCase(),
            },
          }
        : {};

      // Lấy tổng số bản ghi
      const total = await this.prisma.permission.count({
        where: whereCondition,
      });

      // Lấy dữ liệu với phân trang
      const permissions = await this.prisma.permission.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const permissionDtos = permissions.map(
        (permission) => new PermissionResponseDto(permission),
      );

      return new PaginationResponseDto(permissionDtos, page, limit, total);
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách quyền hạn');
    }
  }

  /**
   * Lấy thông tin chi tiết một quyền hạn
   */
  async findOne(id: string): Promise<PermissionResponseDto> {
    try {
      const permission = await this.prisma.permission.findUnique({
        where: { id },
      });

      if (!permission) {
        throw new NotFoundException('Không tìm thấy quyền hạn');
      }

      return new PermissionResponseDto(permission);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin quyền hạn');
    }
  }

  /**
   * Cập nhật quyền hạn
   */
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    try {
      // Kiểm tra permission có tồn tại không
      const existingPermission = await this.prisma.permission.findUnique({
        where: { id },
      });

      if (!existingPermission) {
        throw new NotFoundException('Không tìm thấy quyền hạn');
      }

      // Nếu có cập nhật tên, kiểm tra trung lặp
      if (updatePermissionDto.name) {
        const duplicateName = await this.prisma.permission.findFirst({
          where: {
            name: updatePermissionDto.name.toUpperCase().trim(),
            NOT: { id },
          },
        });

        if (duplicateName) {
          throw new ConflictException(
            `Quyền hạn với tên '${updatePermissionDto.name}' đã tồn tại`,
          );
        }
      }

      // Cập nhật permission
      const updatedPermission = await this.prisma.permission.update({
        where: { id },
        data: {
          ...(updatePermissionDto.name && {
            name: updatePermissionDto.name.toUpperCase().trim(),
          }),
        },
      });

      return new PermissionResponseDto(updatedPermission);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật quyền hạn');
    }
  }

  /**
   * Xóa quyền hạn
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      // Kiểm tra permission có tồn tại không
      const existingPermission = await this.prisma.permission.findUnique({
        where: { id },
        include: {
          rolePermissions: true,
        },
      });

      if (!existingPermission) {
        throw new NotFoundException('Không tìm thấy quyền hạn');
      }

      // Kiểm tra xem permission có đang được sử dụng không
      if (existingPermission.rolePermissions.length > 0) {
        throw new ConflictException(
          'Không thể xóa quyền hạn đang được sử dụng bởi các vai trò',
        );
      }

      // Xóa permission
      await this.prisma.permission.delete({
        where: { id },
      });

      return { message: 'Xóa quyền hạn thành công' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa quyền hạn');
    }
  }

  /**
   * Kiểm tra quyền hạn có tồn tại không
   */
  async exists(id: string): Promise<boolean> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    return !!permission;
  }

  /**
   * Lấy danh sách quyền hạn theo tên
   */
  async findByNames(names: string[]): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        name: {
          in: names.map((name) => name.toUpperCase().trim()),
        },
      },
    });

    return permissions.map(
      (permission) => new PermissionResponseDto(permission),
    );
  }

  /**
   * Tạo nhiều quyền hạn cùng lúc
   */
  async createMany(names: string[]): Promise<PermissionResponseDto[]> {
    try {
      // Chuẩn hóa tên
      const normalizedNames = names.map((name) => name.toUpperCase().trim());

      // Kiểm tra trung lặp trong input
      const uniqueNames = [...new Set(normalizedNames)];

      // Kiểm tra permission đã tồn tại
      const existingPermissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: uniqueNames,
          },
        },
      });

      const existingNames = existingPermissions.map((p) => p.name);
      const newNames = uniqueNames.filter(
        (name) => !existingNames.includes(name),
      );

      if (newNames.length === 0) {
        throw new ConflictException('Tất cả quyền hạn đã tồn tại');
      }

      // Tạo các permission mới
      const createData = newNames.map((name) => ({ name }));

      await this.prisma.permission.createMany({
        data: createData,
      });

      // Lấy lại dữ liệu đã tạo
      const createdPermissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: newNames,
          },
        },
      });

      return createdPermissions.map(
        (permission) => new PermissionResponseDto(permission),
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo danh sách quyền hạn');
    }
  }
}
