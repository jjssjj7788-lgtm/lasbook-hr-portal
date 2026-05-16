import { JobTypesService } from './job-types.service';
export declare class JobTypesController {
    private readonly jobTypesService;
    constructor(jobTypesService: JobTypesService);
    findAll(): Promise<any>;
    create(body: any): Promise<any>;
    updateTier(tierId: string, body: {
        salary: number;
    }): Promise<any>;
    removeTier(tierId: string): Promise<{
        message: string;
    }>;
    updateCustomField(fieldId: string, body: any): Promise<any>;
    removeCustomField(fieldId: string): Promise<{
        message: string;
    }>;
    update(id: string, body: any): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addTier(id: string, body: {
        investmentAmount: number;
        worksInStore: boolean;
        salary: number;
    }): Promise<any>;
    addCustomField(id: string, body: any): Promise<any>;
}
