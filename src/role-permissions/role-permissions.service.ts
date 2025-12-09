import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { AssignPermissionsToRoleDto } from './dto/assign-permissions-to-role.dto';

@Injectable()
export class RolePermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createRolePermissionDto: CreateRolePermissionDto) {
    try {
      const { roleId, permissionIds } = createRolePermissionDto;

      // Kiểm tra role có tồn tại không
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      // Kiểm tra permissions có tồn tại không
      const permissions = await this.prisma.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('Một hoặc nhiều quyền không tồn tại');
      }

      // Kiểm tra quyền đã được gán chưa
      const existingRolePermissions = await this.prisma.rolePermission.findMany(
        {
          where: {
            roleId,
            permissionId: {
              in: permissionIds,
            },
          },
        },
      );

      if (existingRolePermissions.length > 0) {
        throw new ConflictException(
          'Một hoặc nhiều quyền đã được gán cho vai trò này',
        );
      }

      // Tạo role permissions
      const rolePermissions = await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });

      return {
        success: true,
        message: `Đã gán ${rolePermissions.count} quyền cho vai trò thành công`,
        data: { count: rolePermissions.count },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Không thể gán quyền cho vai trò');
    }
  }

  async assignPermissionsToRole(
    roleId: string,
    assignDto: AssignPermissionsToRoleDto,
  ) {
    try {
      const { permissionIds } = assignDto;

      // Kiểm tra role có tồn tại không
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      // Bảo vệ vai trò hệ thống (Super Admin)
      if (role.isDeletable === false) {
        throw new ConflictException(
          'Không thể thay đổi quyền của vai trò hệ thống (Super Admin)',
        );
      }

      // Kiểm tra permissions có tồn tại không
      const permissions = await this.prisma.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('Một hoặc nhiều quyền không tồn tại');
      }

      // Xóa tất cả quyền hiện tại của role
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Thêm quyền mới
      const rolePermissions = await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });

      // Lấy thông tin role với permissions mới
      const updatedRole = await this.prisma.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return {
        success: true,
        message: `Đã cập nhật ${rolePermissions.count} quyền cho vai trò thành công`,
        data: {
          role: {
            id: updatedRole.id,
            name: updatedRole.name,
            permissions: updatedRole.rolePermissions.map((rp) => rp.permission),
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật quyền cho vai trò');
    }
  }

  async findAll() {
    try {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        include: {
          role: true,
          permission: true,
        },
        orderBy: {
          role: {
            name: 'asc',
          },
        },
      });

      return {
        success: true,
        message: 'Lấy danh sách gán quyền thành công',
        data: rolePermissions,
      };
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách gán quyền');
    }
  }

  async findRolePermissions(roleId: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      return {
        success: true,
        message: 'Lấy danh sách quyền của vai trò thành công',
        data: {
          role: {
            id: role.id,
            name: role.name,
          },
          permissions: role.rolePermissions.map((rp) => rp.permission),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Không thể lấy danh sách quyền của vai trò',
      );
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    try {
      const rolePermission = await this.prisma.rolePermission.findFirst({
        where: {
          roleId,
          permissionId,
        },
      });

      if (!rolePermission) {
        throw new NotFoundException(
          'Không tìm thấy quyền được gán cho vai trò này',
        );
      }

      await this.prisma.rolePermission.delete({
        where: {
          id: rolePermission.id,
        },
      });

      return {
        success: true,
        message: 'Đã xóa quyền khỏi vai trò thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa quyền khỏi vai trò');
    }
  }

  async findOne(id: string) {
    try {
      const rolePermission = await this.prisma.rolePermission.findUnique({
        where: { id },
        include: {
          role: true,
          permission: true,
        },
      });

      if (!rolePermission) {
        throw new NotFoundException('Không tìm thấy thông tin gán quyền');
      }

      return {
        success: true,
        message: 'Lấy thông tin gán quyền thành công',
        data: rolePermission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin gán quyền');
    }
  }

  async update(id: string, updateRolePermissionDto: UpdateRolePermissionDto) {
    try {
      const existingRolePermission =
        await this.prisma.rolePermission.findUnique({
          where: { id },
        });

      if (!existingRolePermission) {
        throw new NotFoundException('Không tìm thấy thông tin gán quyền');
      }

      const updatedRolePermission = await this.prisma.rolePermission.update({
        where: { id },
        data: updateRolePermissionDto,
        include: {
          role: true,
          permission: true,
        },
      });

      return {
        success: true,
        message: 'Cập nhật gán quyền thành công',
        data: updatedRolePermission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật gán quyền');
    }
  }

  async remove(id: string) {
    try {
      const existingRolePermission =
        await this.prisma.rolePermission.findUnique({
          where: { id },
        });

      if (!existingRolePermission) {
        throw new NotFoundException('Không tìm thấy thông tin gán quyền');
      }

      await this.prisma.rolePermission.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Xóa gán quyền thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa gán quyền');
    }
  }
}
