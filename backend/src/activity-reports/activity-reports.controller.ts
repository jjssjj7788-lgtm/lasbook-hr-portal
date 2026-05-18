import { Controller, Get, Post, Delete, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityReportsService } from './activity-reports.service';

@Controller('activity-reports')
@UseGuards(JwtAuthGuard)
export class ActivityReportsController {
  constructor(private readonly reportsService: ActivityReportsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.reportsService.findAll(req.user.employeeId, isAdmin, {
      projectId: projectId ? Number(projectId) : undefined,
      employeeId,
      month,
      date,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.findOne(Number(id), req.user.employeeId, req.user.role === 'ADMIN');
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.reportsService.create({
      projectId: Number(body.projectId),
      employeeId: req.user.employeeId,
      prospectCount: Number(body.prospectCount) || 1,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      childAge: body.childAge,
      counselContent: body.counselContent,
      customerReaction: body.customerReaction,
      specialNotes: body.specialNotes,
    });
  }

  @Patch(':id/evaluation')
  updateEvaluation(
    @Param('id') id: string,
    @Body() body: { adminEvaluation: string },
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.reportsService.updateEvaluation(Number(id), body.adminEvaluation);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.reportsService.delete(Number(id));
  }
}
