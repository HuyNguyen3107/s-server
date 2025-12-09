import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from '../permissions.controller';
import { PermissionsService } from '../permissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;

  const mockPermissionResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'USER_CREATE',
    createdAt: new Date(),
  };

  const mockPermissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
    findByNames: jest.fn(),
    createMany: jest.fn(),
  };

  const mockPrismaService = {
    permission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'USER_CREATE',
      };

      mockPermissionsService.create.mockResolvedValue(mockPermissionResponse);

      const result = await controller.create(createPermissionDto);

      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Tạo quyền hạn thành công');
      expect(result.data).toEqual(mockPermissionResponse);
      expect(service.create).toHaveBeenCalledWith(createPermissionDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated permissions', async () => {
      const query = { page: 1, limit: 10 };
      const mockPaginatedResponse = {
        data: [mockPermissionResponse],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockPermissionsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(query);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Lấy danh sách quyền hạn thành công');
      expect(result.data).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockPermissionsService.findOne.mockResolvedValue(mockPermissionResponse);

      const result = await controller.findOne(id);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Lấy thông tin quyền hạn thành công');
      expect(result.data).toEqual(mockPermissionResponse);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'USER_UPDATE',
      };

      const updatedPermission = {
        ...mockPermissionResponse,
        name: 'USER_UPDATE',
      };

      mockPermissionsService.update.mockResolvedValue(updatedPermission);

      const result = await controller.update(id, updatePermissionDto);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Cập nhật quyền hạn thành công');
      expect(result.data).toEqual(updatedPermission);
      expect(service.update).toHaveBeenCalledWith(id, updatePermissionDto);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse = { message: 'Xóa quyền hạn thành công' };

      mockPermissionsService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(id);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Xóa quyền hạn thành công');
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('exists', () => {
    it('should check if permission exists', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockPermissionsService.exists.mockResolvedValue(true);

      const result = await controller.exists(id);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Kiểm tra quyền hạn thành công');
      expect(result.data.exists).toBe(true);
      expect(service.exists).toHaveBeenCalledWith(id);
    });
  });

  describe('findByNames', () => {
    it('should return permissions by names', async () => {
      const names = ['USER_CREATE', 'USER_READ'];
      const mockPermissions = [mockPermissionResponse];

      mockPermissionsService.findByNames.mockResolvedValue(mockPermissions);

      const result = await controller.findByNames({ names });

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe(
        'Lấy danh sách quyền hạn theo tên thành công',
      );
      expect(result.data).toEqual(mockPermissions);
      expect(service.findByNames).toHaveBeenCalledWith(names);
    });
  });

  describe('createMany', () => {
    it('should create multiple permissions', async () => {
      const names = ['USER_CREATE', 'USER_READ'];
      const mockPermissions = [mockPermissionResponse];

      mockPermissionsService.createMany.mockResolvedValue(mockPermissions);

      const result = await controller.createMany({ names });

      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Tạo danh sách quyền hạn thành công');
      expect(result.data).toEqual(mockPermissions);
      expect(service.createMany).toHaveBeenCalledWith(names);
    });
  });
});
