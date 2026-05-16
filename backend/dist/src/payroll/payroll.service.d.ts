import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculatePayroll(periodStart: Date, periodEnd: Date): Promise<any[]>;
    getPayrolls(): Promise<any>;
    getMyPayrolls(userId: number): Promise<any>;
}
