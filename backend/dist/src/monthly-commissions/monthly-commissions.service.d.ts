import { PrismaService } from '../prisma/prisma.service';
export declare class MonthlyCommissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateAndUpsert(employeeId: string, settlementMonth: string): Promise<{
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
        settlementMonth: string;
        performanceRate: number;
        subsidy: number;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        salesCount: number;
        netSalesTotal: number;
        achievementGrade: string | null;
        performanceBonus: number;
        totalGross: number;
        firstPaymentDue: Date | null;
    }>;
    calculateProjectMonth(projectId: number, settlementMonth: string): Promise<(({
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
        settlementMonth: string;
        performanceRate: number;
        subsidy: number;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        salesCount: number;
        netSalesTotal: number;
        achievementGrade: string | null;
        performanceBonus: number;
        totalGross: number;
        firstPaymentDue: Date | null;
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
            isStoreOwner: boolean;
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
        settlementMonth: string;
        performanceRate: number;
        subsidy: number;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        salesCount: number;
        netSalesTotal: number;
        achievementGrade: string | null;
        performanceBonus: number;
        totalGross: number;
        firstPaymentDue: Date | null;
    })[]>;
    updateStatus(id: number, status: 'PENDING' | 'PAID'): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        settlementMonth: string;
        performanceRate: number;
        subsidy: number;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        salesCount: number;
        netSalesTotal: number;
        achievementGrade: string | null;
        performanceBonus: number;
        totalGross: number;
        firstPaymentDue: Date | null;
    }>;
    getPayoutList(projectId: number, month: string): Promise<{
        lines: string[];
        commissions: ({
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
            settlementMonth: string;
            performanceRate: number;
            subsidy: number;
            netAmount: number;
            paymentStatus: string;
            paidAt: Date | null;
            salesCount: number;
            netSalesTotal: number;
            achievementGrade: string | null;
            performanceBonus: number;
            totalGross: number;
            firstPaymentDue: Date | null;
        })[];
    }>;
}
