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
    findAll(requesterId: string, isAdmin: boolean, filters?: {
        projectId?: number;
        employeeId?: string;
        month?: string;
        date?: string;
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
    updateEvaluation(id: number, adminEvaluation: string): Promise<{
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
    delete(id: number): Promise<{
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
