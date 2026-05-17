import { PrismaService } from '../prisma/prisma.service';
export declare class RoomsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(projectId?: number): Promise<any>;
    create(data: {
        projectId: number;
        name: string;
        managerId?: string;
    }): Promise<any>;
    update(id: number, data: {
        name?: string;
        managerId?: string;
        isActive?: boolean;
    }): Promise<any>;
    remove(id: number): Promise<any>;
    addMember(roomId: number, employeeId: string): Promise<{
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
    removeMember(employeeId: string): Promise<{
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
