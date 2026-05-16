import { Controller, Get, Post, Put, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.usersService.findAll(
      req.user.employeeId,
      projectId ? Number(projectId) : undefined,
    );
  }

  @Get(':employeeId')
  findOne(@Param('employeeId') employeeId: string, @Request() req: any) {
    return this.usersService.findOne(employeeId, req.user.employeeId);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    // ADMIN만 계정 생성 가능
    if (req.user.role !== 'ADMIN') {
      throw new Error('권한이 없습니다.');
    }
    return this.usersService.create({
      ...body,
      contractStart: new Date(body.contractStart),
    });
  }

  @Put(':employeeId')
  update(@Param('employeeId') employeeId: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    const data = { ...body };
    if (data.contractStart) data.contractStart = new Date(data.contractStart);
    return this.usersService.update(employeeId, data);
  }

  @Patch(':employeeId/reset-password')
  resetPassword(@Param('employeeId') employeeId: string, @Body() body: { newPassword: string }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.usersService.resetPassword(employeeId, body.newPassword);
  }

  @Patch('me/change-password')
  changePassword(@Request() req: any, @Body() body: { oldPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.employeeId, body.oldPassword, body.newPassword);
  }
}
