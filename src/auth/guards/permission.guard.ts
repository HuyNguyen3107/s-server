import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PERMISSIONS_KEY,
  PERMISSION_MODE_KEY,
  PermissionMode,
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy danh sách quyền cần kiểm tra từ decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không có decorator @RequirePermissions thì cho qua
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Lấy mode (ALL hoặc ANY), mặc định là ALL
    const mode = this.reflector.getAllAndOverride<PermissionMode>(
      PERMISSION_MODE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const permissionMode: PermissionMode = mode || 'ALL';

    // Lấy user từ request (đã được JwtGuard attach)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Người dùng chưa đăng nhập');
    }

    // Lấy tất cả quyền của user (từ roles)
    const userPermissions = await this.getUserPermissions(user.id);

    // Kiểm tra quyền
    let hasPermission = false;

    if (permissionMode === 'ALL') {
      // Cần có TẤT CẢ quyền
      hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
    } else {
      // Cần có ÍT NHẤT MỘT quyền
      hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );
    }

    if (!hasPermission) {
      const missingPermissions = requiredPermissions.filter(
        (p) => !userPermissions.includes(p),
      );
      throw new ForbiddenException({
        message: 'Bạn không có quyền thực hiện hành động này',
        requiredPermissions,
        missingPermissions,
        permissionMode,
      });
    }

    // Attach permissions vào request để có thể sử dụng sau này
    request.userPermissions = userPermissions;

    return true;
  }

  /**
   * Lấy tất cả quyền của user từ các role được gán
   */
  private async getUserPermissions(userId: string): Promise<string[]> {
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

    // Lấy quyền từ tất cả các role
    userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    // Kiểm tra xem user có quyền system.admin không (Super Admin)
    // Nếu có thì có toàn quyền
    if (permissions.has('system.admin')) {
      // Lấy tất cả quyền trong hệ thống
      const allPermissions = await this.prisma.permission.findMany({
        select: { name: true },
      });
      return allPermissions.map((p) => p.name);
    }

    return Array.from(permissions);
  }
}
