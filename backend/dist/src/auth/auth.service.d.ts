import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(employeeId: string, pass: string): Promise<any>;
    login(employeeId: string, password: string): Promise<{
        access_token: string;
        user: {
            employeeId: any;
            name: any;
            role: any;
            projectId: any;
            positionId: any;
            isStoreOwner: any;
            position: any;
            project: any;
        };
    }>;
}
