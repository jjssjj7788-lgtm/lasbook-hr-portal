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
    create(body: {
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
    bulkCreate(body: {
        projectId: number;
        payMonth: string;
        paymentRound: 1 | 2;
    }, req: any): Promise<(({
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
    updateStatus(id: string, body: {
        status: 'PENDING' | 'PAID';
    }, req: any): Promise<{
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
    updateEligibility(id: string, body: {
        isEligible: boolean;
    }, req: any): Promise<{
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
}
