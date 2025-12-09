import { Test, TestingModule } from '@nestjs/testing';
import { ProductCustomsService } from './product-customs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductCustomsService', () => {
  let service: ProductCustomsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCustomsService,
        {
          provide: PrismaService,
          useValue: {
            productCustom: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            productCategory: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            inventory: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductCustomsService>(ProductCustomsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined prisma service', () => {
    expect(prismaService).toBeDefined();
  });
});
