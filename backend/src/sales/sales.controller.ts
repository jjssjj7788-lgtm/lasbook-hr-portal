import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: string,
  ) {
    return this.salesService.findAll(req.user.employeeId, {
      projectId: projectId ? Number(projectId) : undefined,
      employeeId,
      month,
    });
  }

  @Get('summary')
  getSummary(@Query('projectId') projectId: string, @Query('month') month: string) {
    return this.salesService.getMonthSummary(Number(projectId), month);
  }

  @Post()
  create(@Body() body: any) {
    return this.salesService.create({
      ...body,
      saleDate: new Date(body.saleDate),
      projectId: Number(body.projectId),
      productId: Number(body.productId),
      actualAmount: Number(body.actualAmount),
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    const data = { ...body };
    if (data.saleDate) data.saleDate = new Date(data.saleDate);
    return this.salesService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.salesService.delete(Number(id));
  }
}
