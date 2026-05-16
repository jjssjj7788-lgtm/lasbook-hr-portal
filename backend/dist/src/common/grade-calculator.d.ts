export interface GradeResult {
    grade: string;
    performanceRate: number;
    subsidy: number;
}
export declare function calculateGrade(projectName: string, salesCount: number): GradeResult | null;
export declare function calcSalesCount(netSalesTotal: number): number;
export declare function calcNetAmount(grossAmount: number): number;
export declare function calcDeductedFee(actualAmount: number, paymentMethod: string): number;
export declare function calcPaymentDueDate(settlementMonth: string, isStoreOwner: boolean): Date;
export declare function calcSalesWeek(contractStart: Date, targetDate: Date): number;
