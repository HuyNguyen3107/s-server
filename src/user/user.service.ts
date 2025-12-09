import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, phone, isActive = true } = createUserDto;

    // Check if user already exists
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByPhone = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException('User with this phone already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        isDeletable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          isActive: true,
          isDeletable: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Users retrieved successfully',
      data: {
        users,
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        isDeletable: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        phone: true,
        isDeletable: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if trying to update system account's status
    if (!existingUser.isDeletable && updateUserDto.isActive !== undefined) {
      throw new BadRequestException(
        'Cannot change status of system account (Super Admin)',
      );
    }

    const { email, password, name, phone, isActive } = updateUserDto;

    // Check for conflicts if updating email or phone
    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (phone && phone !== existingUser.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (phoneExists) {
        throw new ConflictException('User with this phone already exists');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash new password if provided
    if (password) {
      // Verify current password if provided (for profile update security)
      if (updateUserDto.currentPassword) {
        const isPasswordValid = await bcrypt.compare(
          updateUserDto.currentPassword,
          existingUser.passwordHash,
        );
        if (!isPasswordValid) {
          throw new UnauthorizedException('Current password is incorrect');
        }
      }

      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    updateData.updatedAt = new Date();

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        isDeletable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        isDeletable: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user is deletable
    if (!existingUser.isDeletable) {
      throw new BadRequestException(
        'This user is a system account and cannot be deleted',
      );
    }

    // Delete all related records first to avoid foreign key constraint violations
    // 1. Delete refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    // 2. Delete user roles
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // 3. Update orders (set userId to null instead of deleting orders)
    await this.prisma.order.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    // 4. Finally delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
    };
  }

  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User roles retrieved successfully',
      data: {
        userId: user.id,
        userName: user.name,
        roles: user.userRoles.map((ur) => ur.role),
      },
    };
  }
}
