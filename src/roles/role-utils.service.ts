import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleUtilsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Kiểm tra user có quyền cụ thể không
   */
  async userHasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return userRoles.some((userRole) =>
      userRole.role.rolePermissions.some(
        (rp) => rp.permission.name === permissionName,
      ),
    );
  }

  /**
   * Lấy tất cả quyền của user
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();

    userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Kiểm tra user có vai trò cụ thể không
   */
  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          name: roleName,
        },
      },
    });

    return !!userRole;
  }

  /**
   * Lấy tất cả vai trò của user
   */
  async getUserRoles(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });

    return userRoles.map((ur) => ur.role);
  }

  /**
   * Lấy tất cả vai trò của user với thông tin user
   */
  async getUserRolesWithUserInfo(userId: string) {
    const [user, roles] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      this.getUserRoles(userId),
    ]);

    return {
      userId,
      userName: user?.name || '',
      roles,
    };
  }

  /**
   * So sánh quyền giữa hai role
   */
  async compareRolePermissions(roleId1: string, roleId2: string) {
    const [role1, role2] = await Promise.all([
      this.prisma.role.findUnique({
        where: { id: roleId1 },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.role.findUnique({
        where: { id: roleId2 },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
    ]);

    if (!role1 || !role2) {
      throw new Error('One or both roles not found');
    }

    const permissions1 = new Set(
      role1.rolePermissions.map((rp) => rp.permission.name),
    );
    const permissions2 = new Set(
      role2.rolePermissions.map((rp) => rp.permission.name),
    );

    const common = Array.from(permissions1).filter((p) => permissions2.has(p));
    const only1 = Array.from(permissions1).filter((p) => !permissions2.has(p));
    const only2 = Array.from(permissions2).filter((p) => !permissions1.has(p));

    return {
      role1: {
        id: role1.id,
        name: role1.name,
        permissionCount: permissions1.size,
      },
      role2: {
        id: role2.id,
        name: role2.name,
        permissionCount: permissions2.size,
      },
      comparison: {
        commonPermissions: common,
        onlyInRole1: only1,
        onlyInRole2: only2,
        commonCount: common.length,
        uniqueToRole1Count: only1.length,
        uniqueToRole2Count: only2.length,
      },
    };
  }

  /**
   * Tìm users chưa có vai trò nào
   */
  async getUsersWithoutRoles() {
    const usersWithoutRoles = await this.prisma.user.findMany({
      where: {
        userRoles: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      count: usersWithoutRoles.length,
      users: usersWithoutRoles,
    };
  }

  /**
   * Lấy thống kê về roles và permissions
   */
  async getRoleStatistics() {
    const [
      totalRoles,
      totalPermissions,
      totalRolePermissions,
      totalUsers,
      totalUserRoles,
      rolesWithMostPermissions,
      rolesWithMostUsers,
    ] = await Promise.all([
      this.prisma.role.count(),
      this.prisma.permission.count(),
      this.prisma.rolePermission.count(),
      this.prisma.user.count(),
      this.prisma.userRole.count(),
      this.prisma.role.findMany({
        include: {
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
        orderBy: {
          rolePermissions: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.role.findMany({
        include: {
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
        orderBy: {
          userRoles: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const usersWithoutRoles = await this.getUsersWithoutRoles();

    return {
      summary: {
        totalRoles,
        totalPermissions,
        totalRolePermissions,
        totalUsers,
        totalUserRoles,
        usersWithoutRolesCount: usersWithoutRoles.count,
        averagePermissionsPerRole:
          totalRoles > 0 ? totalRolePermissions / totalRoles : 0,
        averageRolesPerUser: totalUsers > 0 ? totalUserRoles / totalUsers : 0,
      },
      topRoles: {
        byPermissionCount: rolesWithMostPermissions.map((role) => ({
          id: role.id,
          name: role.name,
          permissionCount: role._count.rolePermissions,
        })),
        byUserCount: rolesWithMostUsers.map((role) => ({
          id: role.id,
          name: role.name,
          userCount: role._count.userRoles,
        })),
      },
      usersWithoutRoles,
    };
  }
}
