import { Module } from '@nestjs/common';
import { BackgroundsService } from './backgrounds.service';
import { BackgroundsController } from './backgrounds.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BackgroundsController],
  providers: [BackgroundsService],
  exports: [BackgroundsService],
})
export class BackgroundsModule {}
