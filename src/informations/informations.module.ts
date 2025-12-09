import { Module } from '@nestjs/common';
import { InformationsService } from './informations.service';
import { InformationsController } from './informations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InformationsController],
  providers: [InformationsService],
  exports: [InformationsService],
})
export class InformationsModule {}
