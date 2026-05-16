import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SalesModule } from './sales/sales.module';
import { ActivityReportsModule } from './activity-reports/activity-reports.module';
import { ActivityFeesModule } from './activity-fees/activity-fees.module';
import { MonthlyCommissionsModule } from './monthly-commissions/monthly-commissions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,       // Projects + Products + Positions
    AttendanceModule,
    SalesModule,
    ActivityReportsModule,
    ActivityFeesModule,
    MonthlyCommissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
