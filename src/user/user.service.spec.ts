import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userRole: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '0123456789',
      isActive: true,
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: 'user-id',
        email: createUserDto.email,
        name: createUserDto.name,
        phone: createUserDto.phone,
        isActive: createUserDto.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // No existing email
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // No existing phone
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result.message).toBe('User created successfully');
      expect(result.data).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = { id: 'existing-id', email: createUserDto.email };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('User with this email already exists'),
      );
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const userId = 'user-id';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        phone: '0123456789',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(result.message).toBe('User retrieved successfully');
      expect(result.data).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('remove (Super Admin Protection)', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when trying to delete non-deletable user (Super Admin)', async () => {
      const mockUser = {
        id: 'super-admin-id',
        isDeletable: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.remove('super-admin-id')).rejects.toThrow(
        'This user is a system account and cannot be deleted',
      );
    });

    it('should successfully delete a deletable user', async () => {
      const mockUser = {
        id: 'regular-user-id',
        isDeletable: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRole.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('regular-user-id');

      expect(result).toEqual({
        message: 'User deleted successfully',
      });
      expect(mockPrismaService.userRole.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'regular-user-id' },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'regular-user-id' },
      });
    });

    it('should check isDeletable field before attempting deletion', async () => {
      const mockUser = {
        id: 'protected-user-id',
        isDeletable: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.remove('protected-user-id')).rejects.toThrow();

      // Verify that delete was never called
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      expect(mockPrismaService.userRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should allow deletion of user with isDeletable=true', async () => {
      const deletableUser = {
        id: 'deletable-user',
        isDeletable: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(deletableUser);
      mockPrismaService.userRole.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.user.delete.mockResolvedValue(deletableUser);

      await expect(service.remove('deletable-user')).resolves.toEqual({
        message: 'User deleted successfully',
      });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
