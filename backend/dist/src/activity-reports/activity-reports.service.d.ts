import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        projectId: number;
        employeeId: string;
        prospectCount: number;
        counselContent?: string;
        specialNotes?: string;
    }): Promise<{
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
    findAll(requesterId: string, isAdmin: boolean, filters?: {
        projectId?: number;
        employeeId?: string;
        month?: string;
    }): Promise<{
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
    findOne(id: number, requesterId: string, isAdmin: boolean): Promise<{
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
    updateEvaluation(id: number, adminEvaluation: string): Promise<{
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
    delete(id: number): Promise<{
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
