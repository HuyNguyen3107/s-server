import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role với tên này đã tồn tại');
      }

      const role = await this.prisma.role.create({
        data: {
          name: createRoleDto.name,
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              userRoles: true,
              rolePermissions: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Tạo vai trò thành công',
        data: {
          id: role.id,
          name: role.name,
          isDeletable: role.isDeletable,
          createdAt: role.createdAt,
          permissions: role.rolePermissions.map((rp) => rp.permission),
          userCount: role._count.userRoles,
          permissionCount: role._count.rolePermissions,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo vai trò');
    }
  }

  async findAll() {
    try {
      const roles = await this.prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              userRoles: true,
              rolePermissions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const formattedRoles = roles.map((role) => ({
        id: role.id,
        name: role.name,
        isDeletable: role.isDeletable,
        createdAt: role.createdAt,
        permissions: role.rolePermissions.map((rp) => rp.permission),
        userCount: role._count.userRoles,
        permissionCount: role._count.rolePermissions,
      }));

      return {
        success: true,
        message: 'Lấy danh sách vai trò thành công',
        data: formattedRoles,
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách vai trò');
    }
  }

  async findOne(id: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoles: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              userRoles: true,
              rolePermissions: true,
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      const formattedRole = {
        id: role.id,
        name: role.name,
        isDeletable: role.isDeletable,
        createdAt: role.createdAt,
        permissions: role.rolePermissions.map((rp) => rp.permission),
        users: role.userRoles.map((ur) => ur.user),
        userCount: role._count.userRoles,
        permissionCount: role._count.rolePermissions,
      };

      return {
        success: true,
        message: 'Lấy thông tin vai trò thành công',
        data: formattedRole,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin vai trò');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      // Bảo vệ vai trò hệ thống (Super Admin)
      if (existingRole.isDeletable === false) {
        throw new ConflictException(
          'Không thể chỉnh sửa vai trò hệ thống (Super Admin)',
        );
      }

      if (updateRoleDto.name) {
        // Sử dụng findFirst thay vì findUnique để hỗ trợ điều kiện NOT
        const roleWithSameName = await this.prisma.role.findFirst({
          where: {
            name: updateRoleDto.name,
            NOT: { id },
          },
        });

        if (roleWithSameName) {
          throw new ConflictException('Role với tên này đã tồn tại');
        }
      }

      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              userRoles: true,
              rolePermissions: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Cập nhật vai trò thành công',
        data: {
          id: updatedRole.id,
          name: updatedRole.name,
          isDeletable: updatedRole.isDeletable,
          createdAt: updatedRole.createdAt,
          permissions: updatedRole.rolePermissions.map((rp) => rp.permission),
          userCount: updatedRole._count.userRoles,
          permissionCount: updatedRole._count.rolePermissions,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật vai trò');
    }
  }

  async remove(id: string) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
      });

      if (!existingRole) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      // Bảo vệ vai trò hệ thống (Super Admin)
      if (existingRole.isDeletable === false) {
        throw new ConflictException(
          'Không thể xóa vai trò hệ thống (Super Admin)',
        );
      }

      if (existingRole._count.userRoles > 0) {
        throw new ConflictException(
          'Không thể xóa vai trò đang được sử dụng bởi người dùng',
        );
      }

      // Sử dụng transaction để đảm bảo xóa cả rolePermissions và role
      await this.prisma.$transaction(async (tx) => {
        // Xóa tất cả rolePermissions liên quan trước
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Sau đó xóa role
        await tx.role.delete({
          where: { id },
        });
      });

      return {
        success: true,
        message: 'Xóa vai trò thành công',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Delete role error:', error);
      throw new BadRequestException('Không thể xóa vai trò');
    }
  }
}
