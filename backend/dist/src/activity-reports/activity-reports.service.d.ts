import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        projectId: number;
        employeeId: string;
        prospectCount: number;
        customerName?: string;
        customerPhone?: string;
        childAge?: string;
        counselContent?: string;
        customerReaction?: string;
        specialNotes?: string;
    }): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                id: number;
                projectId: number;
                name: string;
                isActive: boolean;
                managerId: string | null;
            } | null;
        };
    } & {
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
        id: number;
        projectId: number;
        employeeId: string;
    }>;
    findAll(requesterId: string, isAdmin: boolean, filters?: {
        projectId?: number;
        employeeId?: string;
        month?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
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
        id: number;
        projectId: number;
        employeeId: string;
    }[]>;
    findOne(id: number, requesterId: string, isAdmin: boolean): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                id: number;
                projectId: number;
                name: string;
                isActive: boolean;
                managerId: string | null;
            } | null;
        };
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
        id: number;
        projectId: number;
        employeeId: string;
    }>;
    updateEvaluation(id: number, adminEvaluation: string): Promise<{
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
        id: number;
        projectId: number;
        employeeId: string;
    }>;
    delete(id: number): Promise<{
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
        id: number;
        projectId: number;
        employeeId: string;
    }>;
}
