import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { RemoveRolesDto } from './dto/remove-roles.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    const { userId, roleId } = createUserRoleDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user-role relationship already exists
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        idx_user_roles_unique: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role');
    }

    // Create user-role relationship
    const userRole = await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Role assigned to user successfully',
      data: userRole,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    roleId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (roleId) where.roleId = roleId;

    const [userRoles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { user: { name: 'asc' } },
      }),
      this.prisma.userRole.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'User roles retrieved successfully',
      data: {
        userRoles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    };
  }

  async findOne(id: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    return {
      message: 'User role retrieved successfully',
      data: userRole,
    };
  }

  async update(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!existingUserRole) {
      throw new NotFoundException('User role not found');
    }

    const { userId, roleId } = updateUserRoleDto;

    // Check if user exists (if updating userId)
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Check if role exists (if updating roleId)
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    // Check for duplicate if updating userId or roleId
    if (userId || roleId) {
      const checkUserId = userId || existingUserRole.userId;
      const checkRoleId = roleId || existingUserRole.roleId;

      const duplicate = await this.prisma.userRole.findFirst({
        where: {
          userId: checkUserId,
          roleId: checkRoleId,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException('User already has this role');
      }
    }

    // Update user role
    const updatedUserRole = await this.prisma.userRole.update({
      where: { id },
      data: {
        ...(userId && { userId }),
        ...(roleId && { roleId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'User role updated successfully',
      data: updatedUserRole,
    };
  }

  async remove(id: string) {
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!existingUserRole) {
      throw new NotFoundException('User role not found');
    }

    await this.prisma.userRole.delete({
      where: { id },
    });

    return {
      message: 'User role removed successfully',
    };
  }

  async assignRoles(assignRolesDto: AssignRolesDto) {
    const { userId, roleIds } = assignRolesDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDeletable: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is a system account (cannot assign roles)
    if (!user.isDeletable) {
      throw new BadRequestException(
        'Cannot assign roles to system account (Super Admin)',
      );
    }

    // Check if all roles exist
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    if (roles.length !== roleIds.length) {
      const foundRoleIds = roles.map((r) => r.id);
      const missingRoles = roleIds.filter((id) => !foundRoleIds.includes(id));
      throw new NotFoundException(
        `Roles not found: ${missingRoles.join(', ')}`,
      );
    }

    // Check if any of the roles are system roles (cannot be assigned to regular users)
    const systemRoles = roles.filter((role) => role.isDeletable === false);
    if (systemRoles.length > 0) {
      throw new BadRequestException(
        `Cannot assign system roles (${systemRoles.map((r) => r.name).join(', ')}) to regular users`,
      );
    }

    // Get existing user roles
    const existingUserRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });

    const existingRoleIds = existingUserRoles.map((ur) => ur.roleId);
    const newRoleIds = roleIds.filter(
      (roleId) => !existingRoleIds.includes(roleId),
    );

    if (newRoleIds.length === 0) {
      return {
        message: 'User already has all specified roles',
        data: { assignedRoles: 0, existingRoles: roleIds.length },
      };
    }

    // Create new user-role relationships
    const userRoleData = newRoleIds.map((roleId) => ({
      userId,
      roleId,
    }));

    await this.prisma.userRole.createMany({
      data: userRoleData,
    });

    return {
      message: 'Roles assigned to user successfully',
      data: {
        userId,
        assignedRoles: newRoleIds.length,
        skippedExistingRoles: roleIds.length - newRoleIds.length,
        totalRoles: roleIds.length,
      },
    };
  }

  async removeRolesFromUser(userId: string, removeRolesDto: RemoveRolesDto) {
    const { roleIds } = removeRolesDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDeletable: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is a system account (cannot remove roles)
    if (!user.isDeletable) {
      throw new BadRequestException(
        'Cannot remove roles from system account (Super Admin)',
      );
    }

    // Remove user roles
    const result = await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: { in: roleIds },
      },
    });

    return {
      message: 'Roles removed from user successfully',
      data: {
        userId,
        removedRoles: result.count,
        requestedRoles: roleIds.length,
      },
    };
  }

  async getUsersByRole(roleId: string, page: number = 1, limit: number = 10) {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const skip = (page - 1) * limit;

    const [userRoles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where: { roleId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: { user: { name: 'asc' } },
      }),
      this.prisma.userRole.count({ where: { roleId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Users with role retrieved successfully',
      data: {
        role: {
          id: role.id,
          name: role.name,
        },
        users: userRoles.map((ur) => ur.user),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    };
  }
}
