import { PrismaService } from '../prisma/prisma.service';
export declare class JobTypesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    create(data: {
        name: string;
        requiresAttendance: boolean;
        hasInvestmentTiers?: boolean;
        hasCustomFields?: boolean;
        paymentDay?: number | null;
        baseSalary: number;
        perSessionRate?: number | null;
        isPrepaidFirstMonth?: boolean;
    }): Promise<any>;
    update(id: number, data: any): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
    addTier(jobTypeId: number, data: {
        investmentAmount: number;
        worksInStore: boolean;
        salary: number;
    }): Promise<any>;
    updateTier(tierId: number, data: {
        salary: number;
    }): Promise<any>;
    removeTier(tierId: number): Promise<{
        message: string;
    }>;
    addCustomField(jobTypeId: number, data: {
        fieldName: string;
        fieldType?: string;
        placeholder?: string;
        isRequired?: boolean;
        sortOrder?: number;
    }): Promise<any>;
    updateCustomField(fieldId: number, data: Partial<{
        fieldName: string;
        placeholder: string;
        isRequired: boolean;
        sortOrder: number;
    }>): Promise<any>;
    removeCustomField(fieldId: number): Promise<{
        message: string;
    }>;
}
