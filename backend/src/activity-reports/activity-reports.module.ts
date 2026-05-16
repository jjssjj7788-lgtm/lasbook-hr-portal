import { Module } from '@nestjs/common';
import { ActivityReportsController } from './activity-reports.controller';
import { ActivityReportsService } from './activity-reports.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityReportsController],
  providers: [ActivityReportsService],
  exports: [ActivityReportsService],
})
export class ActivityReportsModule {}
