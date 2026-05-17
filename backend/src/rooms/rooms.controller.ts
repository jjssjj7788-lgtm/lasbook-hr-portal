import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsService } from './rooms.service';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.roomsService.findAll(projectId ? Number(projectId) : undefined);
  }

  @Post()
  create(@Body() body: { projectId: number; name: string; managerId?: string }, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.roomsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.roomsService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.roomsService.remove(Number(id));
  }

  @Patch(':id/members/:employeeId')
  addMember(@Param('id') id: string, @Param('employeeId') employeeId: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.roomsService.addMember(Number(id), employeeId);
  }

  @Delete(':id/members/:employeeId')
  removeMember(@Param('id') id: string, @Param('employeeId') employeeId: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new Error('권한이 없습니다.');
    return this.roomsService.removeMember(employeeId);
  }
}
