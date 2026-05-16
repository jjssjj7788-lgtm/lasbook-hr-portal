import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        employeeId: string;
        password: string;
    }): Promise<{
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
