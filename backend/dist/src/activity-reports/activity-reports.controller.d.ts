import { ActivityReportsService } from './activity-reports.service';
export declare class ActivityReportsController {
    private readonly reportsService;
    constructor(reportsService: ActivityReportsService);
    findAll(req: any, projectId?: string, employeeId?: string, month?: string, date?: string): Promise<{
        project: {
            name: string;
        };
        employee: {
            name: string;
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            employeeId: string;
            room: {
                id: number;
                name: string;
            } | null;
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        customerName: string | null;
        prospectCount: number;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
    }[]>;
    findOne(id: string, req: any): Promise<{
        employee: {
            name: string;
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            room: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: number;
                isActive: boolean;
                managerId: string | null;
            } | null;
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        customerName: string | null;
        prospectCount: number;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
    }>;
    create(body: any, req: any): Promise<{
        employee: {
            name: string;
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            room: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: number;
                isActive: boolean;
                managerId: string | null;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        customerName: string | null;
        prospectCount: number;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
    }>;
    updateEvaluation(id: string, body: {
        adminEvaluation: string;
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        customerName: string | null;
        prospectCount: number;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        customerName: string | null;
        prospectCount: number;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
    }>;
}
