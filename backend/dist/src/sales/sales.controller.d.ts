import { SalesService } from './sales.service';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(req: any, projectId?: string, employeeId?: string, month?: string): Promise<({
        project: {
            name: string;
        };
        product: {
            id: number;
            memberType: string;
            series: string;
            step: string | null;
            language: string;
            price: number;
            isActive: boolean;
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
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        notes: string | null;
        saleDate: Date;
        customerName: string;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        productId: number;
    })[]>;
    getSummary(projectId: string, month: string): Promise<{
        count: number;
        totalActual: number;
        totalFee: number;
        totalNet: number;
    }>;
    create(body: any): Promise<{
        product: {
            id: number;
            memberType: string;
            series: string;
            step: string | null;
            language: string;
            price: number;
            isActive: boolean;
        };
        employee: {
            name: string;
            employeeId: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        notes: string | null;
        saleDate: Date;
        customerName: string;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        productId: number;
    }>;
    update(id: string, body: any, req: any): Promise<{
        product: {
            id: number;
            memberType: string;
            series: string;
            step: string | null;
            language: string;
            price: number;
            isActive: boolean;
        };
        employee: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        notes: string | null;
        saleDate: Date;
        customerName: string;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        productId: number;
    }>;
    delete(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        employeeId: string;
        notes: string | null;
        saleDate: Date;
        customerName: string;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        productId: number;
    }>;
}
