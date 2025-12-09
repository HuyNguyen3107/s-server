import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { GetProductCategoriesQueryDto } from './dto/get-product-categories-query.dto';

describe('ProductCategoriesController', () => {
  let controller: ProductCategoriesController;
  let service: ProductCategoriesService;

  const mockProductCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProductId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStatistics: jest.fn(),
  };

  const mockProductCategory = {
    id: 'uuid-test',
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

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategoriesController],
      providers: [
        {
          provide: ProductCategoriesService,
          useValue: mockProductCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<ProductCategoriesController>(
      ProductCategoriesController,
    );
    service = module.get<ProductCategoriesService>(ProductCategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product category', async () => {
      const createDto: CreateProductCategoryDto = {
        productId: 'product-uuid',
        name: 'Test Category',
      };

      mockProductCategoriesService.create.mockResolvedValue(
        mockProductCategory,
      );

      const result = await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Tạo thể loại sản phẩm thành công');
      expect(result.data).toEqual(mockProductCategory);
    });
  });

  describe('findAll', () => {
    it('should return paginated product categories', async () => {
      const query: GetProductCategoriesQueryDto = {
        page: 1,
        limit: 10,
      };
      const paginatedResult = {
        data: [mockProductCategory],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockProductCategoriesService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Lấy danh sách thể loại sản phẩm thành công');
      expect(result.data).toEqual(paginatedResult.data);
      expect(result.meta).toEqual(paginatedResult.meta);
    });
  });

  describe('findByProductId', () => {
    it('should return categories by product id', async () => {
      const categories = [mockProductCategory];
      mockProductCategoriesService.findByProductId.mockResolvedValue(
        categories,
      );

      const result = await controller.findByProductId('product-uuid');

      expect(service.findByProductId).toHaveBeenCalledWith('product-uuid');
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Lấy thể loại theo sản phẩm thành công');
      expect(result.data).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a product category by id', async () => {
      mockProductCategoriesService.findOne.mockResolvedValue(
        mockProductCategory,
      );

      const result = await controller.findOne('uuid-test');

      expect(service.findOne).toHaveBeenCalledWith('uuid-test');
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Lấy thông tin thể loại sản phẩm thành công');
      expect(result.data).toEqual(mockProductCategory);
    });
  });

  describe('update', () => {
    it('should update a product category', async () => {
      const updateDto: UpdateProductCategoryDto = {
        name: 'Updated Category',
      };
      const updatedCategory = {
        ...mockProductCategory,
        name: 'Updated Category',
      };

      mockProductCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update('uuid-test', updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('uuid-test', updateDto);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Cập nhật thể loại sản phẩm thành công');
      expect(result.data).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should remove a product category', async () => {
      const deleteResult = { message: 'Xóa thể loại sản phẩm thành công' };
      mockProductCategoriesService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('uuid-test', mockUser);

      expect(service.remove).toHaveBeenCalledWith('uuid-test');
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe(deleteResult.message);
    });
  });

  describe('getStatistics', () => {
    it('should return product categories statistics', async () => {
      const statistics = {
        totalCategories: 10,
        totalProductCustoms: 50,
        categoriesByProduct: [],
        customsByCategory: [],
      };

      mockProductCategoriesService.getStatistics.mockResolvedValue(statistics);

      const result = await controller.getStatistics(mockUser);

      expect(service.getStatistics).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Lấy thống kê thể loại sản phẩm thành công');
      expect(result.data).toEqual(statistics);
    });
  });
});
