import { ActivityFeesService } from './activity-fees.service';
export declare class ActivityFeesController {
    private readonly activityFeesService;
    constructor(activityFeesService: ActivityFeesService);
    findAll(req: any, projectId?: string, month?: string, employeeId?: string): Promise<({
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
        employeeId: string;
        id: number;
        projectId: number;
        payMonth: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getPayoutList(projectId: string, month: string): Promise<{
        lines: string[];
        fees: ({
            employee: {
                name: string;
                bank: string | null;
                accountNumber: string | null;
                accountHolder: string | null;
            };
        } & {
            employeeId: string;
            id: number;
            projectId: number;
            payMonth: string;
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
    checkEligibility(projectId: string): Promise<{
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
    checkMyEligibility(req: any): Promise<{
        eligible2nd: boolean;
        subSaleCount: number;
        circleCount: number;
        conditionA: boolean;
        conditionB: boolean;
        detail: string;
        need: string | null;
    } | null>;
    create(body: {
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
        employeeId: string;
        id: number;
        projectId: number;
        payMonth: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    bulkCreate(body: {
        projectId: number;
        payMonth: string;
        paymentRound: 1 | 2;
    }, req: any): Promise<(({
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
        employeeId: string;
        id: number;
        projectId: number;
        payMonth: string;
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
    updateStatus(id: string, body: {
        status: 'PENDING' | 'PAID';
    }, req: any): Promise<{
        employeeId: string;
        id: number;
        projectId: number;
        payMonth: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateEligibility(id: string, body: {
        isEligible: boolean;
    }, req: any): Promise<{
        employeeId: string;
        id: number;
        projectId: number;
        payMonth: string;
        paymentRound: number;
        grossAmount: number;
        isEligible: boolean;
        netAmount: number;
        paymentStatus: string;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
