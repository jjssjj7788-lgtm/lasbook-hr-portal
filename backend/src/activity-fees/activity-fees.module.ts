import { Module } from '@nestjs/common';
import { ActivityFeesController } from './activity-fees.controller';
import { ActivityFeesService } from './activity-fees.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityFeesController],
  providers: [ActivityFeesService],
  exports: [ActivityFeesService],
})
export class ActivityFeesModule {}
