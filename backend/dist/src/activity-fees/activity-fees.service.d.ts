import { PrismaService } from '../prisma/prisma.service';
export declare class ActivityFeesService {
    private prisma;
    constructor(prisma: PrismaService);
    createFee(data: {
        employeeId: string;
        projectId: number;
        payMonth: string;
        paymentRound: 1 | 2;
        isEligible?: boolean;
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
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        payMonth: string;
        netAmount: number;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        paymentStatus: string;
        paidAt: Date | null;
    }>;
    bulkCreateForProject(projectId: number, payMonth: string, paymentRound: 1 | 2): Promise<(({
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
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        payMonth: string;
        netAmount: number;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        paymentStatus: string;
        paidAt: Date | null;
    }) | {
        error: any;
        employeeId: string;
    })[]>;
    findAll(requesterId: string, filters?: {
        projectId?: number;
        month?: string;
        employeeId?: string;
    }): Promise<({
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
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        payMonth: string;
        netAmount: number;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        paymentStatus: string;
        paidAt: Date | null;
    })[]>;
    updateStatus(id: number, status: 'PENDING' | 'PAID'): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        payMonth: string;
        netAmount: number;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        paymentStatus: string;
        paidAt: Date | null;
    }>;
    updateEligibility(id: number, isEligible: boolean): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        payMonth: string;
        netAmount: number;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        paymentStatus: string;
        paidAt: Date | null;
    }>;
    checkEligibility2nd(projectId: number): Promise<{
        employeeId: string;
        name: string;
        position: string;
        contractStart: Date;
        eligible1st: boolean;
        eligible2nd: boolean;
        conditions: {
            hasSale: boolean;
            saleCount: number;
            hasCircle: boolean;
            circleCount: number;
        };
    }[]>;
    getPayoutList(projectId: number, month: string): Promise<{
        lines: string[];
        fees: ({
            employee: {
                name: string;
                bank: string | null;
                accountNumber: string | null;
                accountHolder: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            employeeId: string;
            payMonth: string;
            netAmount: number;
            paymentRound: number;
            grossAmount: number;
            isEligible: boolean;
            paymentStatus: string;
            paidAt: Date | null;
        })[];
    }>;
}
