import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    calculate(body: {
        start: string;
        end: string;
    }): Promise<any[]>;
    getMyPayrolls(req: any): Promise<any>;
    getAll(): Promise<any>;
}
