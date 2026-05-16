import { Module } from '@nestjs/common';
import { MonthlyCommissionsController } from './monthly-commissions.controller';
import { MonthlyCommissionsService } from './monthly-commissions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MonthlyCommissionsController],
  providers: [MonthlyCommissionsService],
  exports: [MonthlyCommissionsService],
})
export class MonthlyCommissionsModule {}
