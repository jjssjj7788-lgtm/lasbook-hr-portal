import { SalesService } from './sales.service';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    findAll(req: any, projectId?: string, employeeId?: string, month?: string): Promise<({
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
        };
        product: {
            id: number;
            isActive: boolean;
            memberType: string;
            series: string;
            step: string | null;
            language: string;
            price: number;
        };
    } & {
        employeeId: string;
        id: number;
        projectId: number;
        saleDate: Date;
        customerName: string;
        productId: number;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSummary(projectId: string, month: string): Promise<{
        count: number;
        totalActual: number;
        totalFee: number;
        totalNet: number;
    }>;
    create(body: any, req: any): Promise<{
        employee: {
            employeeId: string;
            name: string;
        };
        product: {
            id: number;
            isActive: boolean;
            memberType: string;
            series: string;
            step: string | null;
            language: string;
            price: number;
        };
    } & {
        employeeId: string;
        id: number;
        projectId: number;
        saleDate: Date;
        customerName: string;
        productId: number;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: any, req: any): Promise<{
        employee: {
            name: string;
        };
        product: {
            id: number;
            isActive: boolean;
            memberType: string;
            series: string;
            step: string | null;
            language: string;
            price: number;
        };
    } & {
        employeeId: string;
        id: number;
        projectId: number;
        saleDate: Date;
        customerName: string;
        productId: number;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, req: any): Promise<{
        employeeId: string;
        id: number;
        projectId: number;
        saleDate: Date;
        customerName: string;
        productId: number;
        paymentMethod: string;
        actualAmount: number;
        deductedFee: number;
        netAmount: number;
        salesWeek: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
