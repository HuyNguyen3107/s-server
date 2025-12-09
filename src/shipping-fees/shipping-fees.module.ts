import { Module } from '@nestjs/common';
import { ShippingFeesService } from './shipping-fees.service';
import { ShippingFeesController } from './shipping-fees.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ShippingFeesController],
  providers: [ShippingFeesService, PrismaService],
  exports: [ShippingFeesService],
})
export class ShippingFeesModule {}
