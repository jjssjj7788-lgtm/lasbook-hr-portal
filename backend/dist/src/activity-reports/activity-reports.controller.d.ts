import { ActivityReportsService } from './activity-reports.service';
export declare class ActivityReportsController {
    private readonly reportsService;
    constructor(reportsService: ActivityReportsService);
    findAll(req: any, projectId?: string, employeeId?: string, month?: string): Promise<{
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
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        prospectCount: number;
        counselContent: string | null;
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
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        prospectCount: number;
        counselContent: string | null;
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        submittedAt: Date;
        prospectCount: number;
        counselContent: string | null;
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
        prospectCount: number;
        counselContent: string | null;
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
        prospectCount: number;
        counselContent: string | null;
        specialNotes: string | null;
        adminEvaluation: string | null;
    }>;
}
