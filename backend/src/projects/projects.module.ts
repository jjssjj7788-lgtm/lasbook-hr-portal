import { Module } from '@nestjs/common';
import { ProjectsController, ProductsController, PositionsController } from './projects.controller';
import { ProjectsService, ProductsService, PositionsService } from './projects.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController, ProductsController, PositionsController],
  providers: [ProjectsService, ProductsService, PositionsService],
  exports: [ProjectsService, ProductsService, PositionsService],
})
export class ProjectsModule {}
