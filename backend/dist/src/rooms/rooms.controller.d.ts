import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    findAll(projectId?: string): Promise<any>;
    create(body: {
        projectId: number;
        name: string;
        managerId?: string;
    }, req: any): Promise<any>;
    update(id: string, body: any, req: any): Promise<any>;
    remove(id: string, req: any): Promise<any>;
    addMember(id: string, employeeId: string, req: any): Promise<{
        projectId: number;
        employeeId: string;
        positionId: number;
        password: string;
        name: string;
        parentEmployeeId: string | null;
        contractStart: Date;
        isStoreOwner: boolean;
        phone: string | null;
        bank: string | null;
        accountNumber: string | null;
        accountHolder: string | null;
        role: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeMember(id: string, employeeId: string, req: any): Promise<{
        projectId: number;
        employeeId: string;
        positionId: number;
        password: string;
        name: string;
        parentEmployeeId: string | null;
        contractStart: Date;
        isStoreOwner: boolean;
        phone: string | null;
        bank: string | null;
        accountNumber: string | null;
        accountHolder: string | null;
        role: string;
        isActive: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
