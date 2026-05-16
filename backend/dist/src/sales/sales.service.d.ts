import { PrismaService } from '../prisma/prisma.service';
export declare class SalesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        projectId: number;
        saleDate: Date;
        employeeId: string;
        customerName: string;
        productId: number;
        paymentMethod: 'CARD' | 'CASH';
        actualAmount: number;
        notes?: string;
    }): Promise<{
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
    findAll(requesterId: string, filters?: {
        projectId?: number;
        employeeId?: string;
        startDate?: Date;
        endDate?: Date;
        month?: string;
    }): Promise<({
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
    update(id: number, data: Partial<{
        saleDate: Date;
        customerName: string;
        productId: number;
        paymentMethod: string;
        actualAmount: number;
        notes: string;
    }>): Promise<{
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
    delete(id: number): Promise<{
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
    getMonthSummary(projectId: number, month: string): Promise<{
        count: number;
        totalActual: number;
        totalFee: number;
        totalNet: number;
    }>;
}
