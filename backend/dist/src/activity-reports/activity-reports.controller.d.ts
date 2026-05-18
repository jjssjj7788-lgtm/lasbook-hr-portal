import { ActivityReportsService } from './activity-reports.service';
export declare class ActivityReportsController {
    private readonly reportsService;
    constructor(reportsService: ActivityReportsService);
    findAll(req: any, projectId?: string, employeeId?: string, month?: string, date?: string, startDate?: string, endDate?: string): Promise<{
        project: {
            name: string;
        };
        employee: {
            employeeId: string;
            name: string;
            position: {
                id: number;
                projectId: number;
                name: string;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            room: {
                id: number;
                name: string;
            } | null;
        };
        employeeId: string;
        id: number;
        projectId: number;
        submittedAt: Date;
        prospectCount: number;
        customerName: string | null;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, req: any): Promise<{
        employee: {
            name: string;
            position: {
                id: number;
                projectId: number;
                name: string;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            room: {
                id: number;
                projectId: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                managerId: string | null;
            } | null;
        };
        employeeId: string;
        id: number;
        projectId: number;
        submittedAt: Date;
        prospectCount: number;
        customerName: string | null;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: any, req: any): Promise<{
        employee: {
            name: string;
            position: {
                id: number;
                projectId: number;
                name: string;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            room: {
                id: number;
                projectId: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                managerId: string | null;
            } | null;
        };
    } & {
        employeeId: string;
        id: number;
        projectId: number;
        submittedAt: Date;
        prospectCount: number;
        customerName: string | null;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateEvaluation(id: string, body: {
        adminEvaluation: string;
    }, req: any): Promise<{
        employeeId: string;
        id: number;
        projectId: number;
        submittedAt: Date;
        prospectCount: number;
        customerName: string | null;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, req: any): Promise<{
        employeeId: string;
        id: number;
        projectId: number;
        submittedAt: Date;
        prospectCount: number;
        customerName: string | null;
        customerPhone: string | null;
        childAge: string | null;
        counselContent: string | null;
        customerReaction: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
