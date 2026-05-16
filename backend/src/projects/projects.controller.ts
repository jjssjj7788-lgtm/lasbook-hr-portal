import { Controller, Get, Post, Put, Patch, Body, Param, Query, Request, UseGuards, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService, ProductsService, PositionsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}
  @Get() findAll() { return this.projectsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.projectsService.findOne(Number(id)); }
  @Post() create(@Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.projectsService.create(body);
  }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.projectsService.update(Number(id), body);
  }
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get() findAll() { return this.productsService.findAll(); }
  @Post() create(@Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.productsService.create(body);
  }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.productsService.update(Number(id), body);
  }
  @Delete(':id') deactivate(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.productsService.deactivate(Number(id));
  }
}

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}
  @Get() findAll(@Query('projectId') projectId?: string) {
    return this.positionsService.findAll(projectId ? Number(projectId) : undefined);
  }
  @Post() create(@Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.positionsService.create(body);
  }
  @Put(':id') update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.positionsService.update(Number(id), body);
  }
}
