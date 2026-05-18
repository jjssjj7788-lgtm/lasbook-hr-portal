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
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            position: {
                id: number;
                projectId: number;
                name: string;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        };
    } & {
        id: number;
        projectId: number;
        payMonth: string;
        employeeId: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    bulkCreateForProject(projectId: number, payMonth: string, paymentRound: 1 | 2): Promise<(({
        employee: {
            name: string;
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            position: {
                id: number;
                projectId: number;
                name: string;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        };
    } & {
        id: number;
        projectId: number;
        payMonth: string;
        employeeId: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            position: {
                id: number;
                projectId: number;
                name: string;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        };
    } & {
        id: number;
        projectId: number;
        payMonth: string;
        employeeId: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateStatus(id: number, status: 'PENDING' | 'PAID'): Promise<{
        id: number;
        projectId: number;
        payMonth: string;
        employeeId: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateEligibility(id: number, isEligible: boolean): Promise<{
        id: number;
        projectId: number;
        payMonth: string;
        employeeId: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkEligibility2nd(projectId: number): Promise<{
        employeeId: string;
        name: string;
        position: string;
        contractStart: Date;
        eligible1st: boolean;
        eligible2nd: boolean;
        conditions: {
            subSaleCount: number;
            circleCount: number;
            conditionA: boolean;
            conditionB: boolean;
            detail: string;
        };
    }[]>;
    checkMyEligibility(employeeId: string): Promise<{
        eligible2nd: boolean;
        subSaleCount: number;
        circleCount: number;
        conditionA: boolean;
        conditionB: boolean;
        detail: string;
        need: string | null;
    } | null>;
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
            projectId: number;
            payMonth: string;
            employeeId: string;
            paymentRound: number;
            grossAmount: number;
            isEligible: boolean;
            netAmount: number;
            paymentStatus: string;
            paidAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
}
