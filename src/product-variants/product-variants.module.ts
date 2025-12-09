import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService, PrismaService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
