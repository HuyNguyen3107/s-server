import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategoriesService } from './product-categories.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    productCategory: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    productCustom: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockProduct = {
    id: 'product-uuid',
    name: 'Test Product',
    status: 'active',
  };

  const mockProductCategory = {
    id: 'category-uuid',
    productId: 'product-uuid',
    name: 'Test Category',
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: 'product-uuid',
      name: 'Test Product',
      status: 'active',
      collection: {
        id: 'collection-uuid',
        name: 'Test Collection',
      },
    },
    productCustoms: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductCategoriesService>(ProductCategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product category successfully', async () => {
      const createDto = {
        productId: 'product-uuid',
        name: 'Test Category',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productCategory.findFirst.mockResolvedValue(null);
      mockPrismaService.productCategory.create.mockResolvedValue(
        mockProductCategory,
      );

      const result = await service.create(createDto);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-uuid' },
      });
      expect(prismaService.productCategory.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Test Category',
          productId: 'product-uuid',
        },
      });
      expect(prismaService.productCategory.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Category',
          productId: 'product-uuid',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockProductCategory);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const createDto = {
        productId: 'non-existent-uuid',
        name: 'Test Category',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-uuid' },
      });
    });

    it('should throw ConflictException if category name already exists for product', async () => {
      const createDto = {
        productId: 'product-uuid',
        name: 'Existing Category',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productCategory.findFirst.mockResolvedValue(
        mockProductCategory,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated product categories', async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const categories = [mockProductCategory];
      const total = 1;

      mockPrismaService.productCategory.findMany.mockResolvedValue(categories);
      mockPrismaService.productCategory.count.mockResolvedValue(total);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: categories,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product category by id', async () => {
      mockPrismaService.productCategory.findUnique.mockResolvedValue(
        mockProductCategory,
      );

      const result = await service.findOne('category-uuid');

      expect(prismaService.productCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-uuid' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockProductCategory);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.productCategory.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product category successfully', async () => {
      const categoryWithCount = {
        ...mockProductCategory,
        _count: { productCustoms: 0 },
      };

      mockPrismaService.productCategory.findUnique.mockResolvedValue(
        categoryWithCount,
      );
      mockPrismaService.productCategory.delete.mockResolvedValue(
        mockProductCategory,
      );

      const result = await service.remove('category-uuid');

      expect(prismaService.productCategory.delete).toHaveBeenCalledWith({
        where: { id: 'category-uuid' },
      });
      expect(result).toEqual({ message: 'Xóa thể loại sản phẩm thành công' });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.productCategory.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if category has product customs', async () => {
      const categoryWithCustoms = {
        ...mockProductCategory,
        _count: { productCustoms: 5 },
      };

      mockPrismaService.productCategory.findUnique.mockResolvedValue(
        categoryWithCustoms,
      );

      await expect(service.remove('category-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
