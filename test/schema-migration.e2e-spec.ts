import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductsService } from '../src/products/products.service';

describe('Schema Migration Test', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            collection: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Product Schema Changes', () => {
    it('should create product with hasBg field', async () => {
      const mockCollection = { id: 'collection-1', name: 'Test Collection' };
      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        collectionId: 'collection-1',
        status: 'active',
        hasBg: true,
        collection: mockCollection,
        productVariants: [],
        categories: [],
        backgrounds: [],
      };

      jest
        .spyOn(prisma.collection, 'findUnique')
        .mockResolvedValue(mockCollection as any);
      jest
        .spyOn(prisma.product, 'create')
        .mockResolvedValue(mockProduct as any);

      const createDto = {
        name: 'Test Product',
        collectionId: 'collection-1',
        status: 'active',
        hasBg: true,
      };

      const result = await service.create(createDto as any);

      expect(result.hasBg).toBe(true);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Product',
          collectionId: 'collection-1',
          status: 'active',
          hasBg: true,
        },
        include: expect.objectContaining({
          categories: expect.any(Object),
          backgrounds: expect.any(Object),
        }),
      });
    });

    it('should include categories and backgrounds in product queries', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        collectionId: 'collection-1',
        status: 'active',
        hasBg: true,
        collection: { id: 'collection-1', name: 'Test Collection' },
        productVariants: [],
        categories: [{ id: 'cat-1', name: 'Category 1' }],
        backgrounds: [{ id: 'bg-1', name: 'Background 1', imageUrl: 'bg.jpg' }],
      };

      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue(mockProduct as any);

      const result = await service.findOne('product-1');

      expect(result.categories).toBeDefined();
      expect(result.backgrounds).toBeDefined();
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: expect.objectContaining({
          categories: expect.any(Object),
          backgrounds: expect.any(Object),
        }),
      });
    });

    it('should update product with hasBg field', async () => {
      const existingProduct = {
        id: 'product-1',
        name: 'Test Product',
        collectionId: 'collection-1',
        status: 'active',
        hasBg: false,
      };

      const updatedProduct = {
        ...existingProduct,
        hasBg: true,
        collection: { id: 'collection-1', name: 'Test Collection' },
        productVariants: [],
        categories: [],
        backgrounds: [],
      };

      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue(existingProduct as any);
      jest
        .spyOn(prisma.product, 'update')
        .mockResolvedValue(updatedProduct as any);

      const updateDto = {
        hasBg: true,
      };

      const result = await service.update('product-1', updateDto as any);

      expect(result.hasBg).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: expect.objectContaining({
          hasBg: true,
          updatedAt: expect.any(Date),
        }),
        include: expect.objectContaining({
          categories: expect.any(Object),
          backgrounds: expect.any(Object),
        }),
      });
    });
  });
});
