import { MonthlyCommissionsService } from './monthly-commissions.service';
export declare class MonthlyCommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: MonthlyCommissionsService);
    findAll(req: any, projectId?: string, month?: string, employeeId?: string): Promise<({
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
    getPayoutList(projectId: string, month: string): Promise<{
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
    calculateOne(body: {
        employeeId: string;
        settlementMonth: string;
    }, req: any): Promise<{
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
    calculateProject(body: {
        projectId: number;
        settlementMonth: string;
    }, req: any): Promise<(({
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
    updateStatus(id: string, body: {
        status: 'PENDING' | 'PAID';
    }, req: any): Promise<{
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
}
