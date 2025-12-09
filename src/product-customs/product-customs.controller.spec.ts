import { Test, TestingModule } from '@nestjs/testing';
import { ProductCustomsController } from './product-customs.controller';
import { ProductCustomsService } from './product-customs.service';

describe('ProductCustomsController', () => {
  let controller: ProductCustomsController;
  let service: ProductCustomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCustomsController],
      providers: [
        {
          provide: ProductCustomsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByProductCategoryId: jest.fn(),
            updateStatus: jest.fn(),
            getStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductCustomsController>(ProductCustomsController);
    service = module.get<ProductCustomsService>(ProductCustomsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined service', () => {
    expect(service).toBeDefined();
  });
});
