import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        projectId: number;
        educationDate: Date;
        branchName: string;
        traineeId: string;
        mentorId: string;
        isPresent: boolean;
        notes?: string;
    }): Promise<{
        trainee: {
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
        mentor: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    }>;
    update(id: number, data: Partial<{
        isPresent: boolean;
        notes: string;
        branchName: string;
        educationDate: Date;
    }>): Promise<{
        trainee: {
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
        mentor: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    }>;
    findAll(requesterId: string, isAdmin: boolean, filters?: {
        projectId?: number;
        traineeId?: string;
        month?: string;
    }): Promise<({
        project: {
            name: string;
        };
        trainee: {
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
        };
        mentor: {
            name: string;
            employeeId: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    })[]>;
    getTransportFeeSummary(projectId: number, month: string): Promise<{
        summary: {
            name: string;
            count: number;
            gross: number;
            net: number;
            bank: string;
            accountNumber: string;
            accountHolder: string;
        }[];
        lines: string[];
    }>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    }>;
}
