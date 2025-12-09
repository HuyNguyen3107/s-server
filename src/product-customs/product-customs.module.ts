import { Module } from '@nestjs/common';
import { ProductCustomsService } from './product-customs.service';
import { ProductCustomsController } from './product-customs.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProductCustomsController],
  providers: [ProductCustomsService, PrismaService],
  exports: [ProductCustomsService],
})
export class ProductCustomsModule {}
