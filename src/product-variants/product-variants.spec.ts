import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductVariantsModule Integration', () => {
  let controller: ProductVariantsController;
  let service: ProductVariantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVariantsController],
      providers: [ProductVariantsService, PrismaService],
    }).compile();

    controller = module.get<ProductVariantsController>(
      ProductVariantsController,
    );
    service = module.get<ProductVariantsService>(ProductVariantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
