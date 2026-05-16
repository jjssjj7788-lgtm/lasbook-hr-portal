import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('traineeId') traineeId?: string,
    @Query('month') month?: string,
  ) {
    return this.attendanceService.findAll(req.user.employeeId, req.user.role === 'ADMIN', {
      projectId: projectId ? Number(projectId) : undefined,
      traineeId,
      month,
    });
  }

  @Get('transport-summary')
  getTransportSummary(@Query('projectId') projectId: string, @Query('month') month: string) {
    return this.attendanceService.getTransportFeeSummary(Number(projectId), month);
  }

  @Post()
  create(@Body() body: any) {
    return this.attendanceService.create({
      ...body,
      projectId: Number(body.projectId),
      educationDate: new Date(body.educationDate),
      isPresent: Boolean(body.isPresent),
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    const data = { ...body };
    if (data.educationDate) data.educationDate = new Date(data.educationDate);
    return this.attendanceService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.attendanceService.delete(Number(id));
  }
}
