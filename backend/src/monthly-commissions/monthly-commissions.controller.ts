import { Controller, Get, Post, Put, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MonthlyCommissionsService } from './monthly-commissions.service';

@Controller('monthly-commissions')
@UseGuards(JwtAuthGuard)
export class MonthlyCommissionsController {
  constructor(private readonly commissionsService: MonthlyCommissionsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('month') month?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.commissionsService.findAll(req.user.employeeId, {
      projectId: projectId ? Number(projectId) : undefined,
      month,
      employeeId,
    });
  }

  @Get('payout')
  getPayoutList(@Query('projectId') projectId: string, @Query('month') month: string) {
    return this.commissionsService.getPayoutList(Number(projectId), month);
  }

  @Post('calculate')
  calculateOne(@Body() body: { employeeId: string; settlementMonth: string }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.commissionsService.calculateAndUpsert(body.employeeId, body.settlementMonth);
  }

  @Post('calculate-project')
  calculateProject(@Body() body: { projectId: number; settlementMonth: string }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.commissionsService.calculateProjectMonth(body.projectId, body.settlementMonth);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: 'PENDING' | 'PAID' }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.commissionsService.updateStatus(Number(id), body.status);
  }
}
