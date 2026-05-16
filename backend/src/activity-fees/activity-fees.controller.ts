import { Controller, Get, Post, Put, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityFeesService } from './activity-fees.service';

@Controller('activity-fees')
@UseGuards(JwtAuthGuard)
export class ActivityFeesController {
  constructor(private readonly activityFeesService: ActivityFeesService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('month') month?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.activityFeesService.findAll(req.user.employeeId, {
      projectId: projectId ? Number(projectId) : undefined,
      month,
      employeeId,
    });
  }

  @Get('payout')
  getPayoutList(@Query('projectId') projectId: string, @Query('month') month: string) {
    return this.activityFeesService.getPayoutList(Number(projectId), month);
  }

  @Post()
  create(@Body() body: { employeeId: string; projectId: number; payMonth: string; paymentRound: 1 | 2; isEligible?: boolean }) {
    return this.activityFeesService.createFee(body);
  }

  @Post('bulk')
  bulkCreate(@Body() body: { projectId: number; payMonth: string; paymentRound: 1 | 2 }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.activityFeesService.bulkCreateForProject(body.projectId, body.payMonth, body.paymentRound);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: 'PENDING' | 'PAID' }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.activityFeesService.updateStatus(Number(id), body.status);
  }

  @Patch(':id/eligibility')
  updateEligibility(@Param('id') id: string, @Body() body: { isEligible: boolean }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.activityFeesService.updateEligibility(Number(id), body.isEligible);
  }
}
