import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(employeeId: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmployeeId(employeeId);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(employeeId: string, password: string) {
    const user = await this.validateUser(employeeId, password);
    if (!user) {
      throw new UnauthorizedException('사원번호 또는 비밀번호가 올바르지 않습니다.');
    }
    const payload = {
      sub: user.employeeId,
      role: user.role,
      projectId: user.projectId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        projectId: user.projectId,
        positionId: user.positionId,
        isStoreOwner: user.isStoreOwner,
        position: user.position,
        project: user.project,
      },
    };
  }
}
