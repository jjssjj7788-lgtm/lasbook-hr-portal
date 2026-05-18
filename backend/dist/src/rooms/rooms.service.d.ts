import { PrismaService } from '../prisma/prisma.service';
export declare class RoomsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(projectId?: number): Promise<({
        project: {
            name: string;
        };
        members: ({
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        } & {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            isActive: boolean;
            employeeId: string;
            positionId: number;
            roomId: number | null;
            password: string;
            parentEmployeeId: string | null;
            contractStart: Date;
            isStoreOwner: boolean;
            phone: string | null;
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            role: string;
            notes: string | null;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        managerId: string | null;
    })[]>;
    create(data: {
        projectId: number;
        name: string;
        managerId?: string;
    }): Promise<{
        project: {
            name: string;
        };
        members: ({
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        } & {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            isActive: boolean;
            employeeId: string;
            positionId: number;
            roomId: number | null;
            password: string;
            parentEmployeeId: string | null;
            contractStart: Date;
            isStoreOwner: boolean;
            phone: string | null;
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            role: string;
            notes: string | null;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        managerId: string | null;
    }>;
    update(id: number, data: {
        name?: string;
        managerId?: string;
        isActive?: boolean;
    }): Promise<{
        project: {
            name: string;
        };
        members: ({
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        } & {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            isActive: boolean;
            employeeId: string;
            positionId: number;
            roomId: number | null;
            password: string;
            parentEmployeeId: string | null;
            contractStart: Date;
            isStoreOwner: boolean;
            phone: string | null;
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            role: string;
            notes: string | null;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        managerId: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        managerId: string | null;
    }>;
    addMember(roomId: number, employeeId: string): Promise<{
        addedCount: number;
        employeeIds: string[];
        rootUser: ({
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        } & {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            isActive: boolean;
            employeeId: string;
            positionId: number;
            roomId: number | null;
            password: string;
            parentEmployeeId: string | null;
            contractStart: Date;
            isStoreOwner: boolean;
            phone: string | null;
            bank: string | null;
            accountNumber: string | null;
            accountHolder: string | null;
            role: string;
            notes: string | null;
        }) | null;
    }>;
    removeMember(employeeId: string): Promise<{
        position: {
            id: number;
            name: string;
            projectId: number;
            code: string;
            fee1st: number;
            fee2nd: number;
        };
    } & {
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        employeeId: string;
        positionId: number;
        roomId: number | null;
        password: string;
        parentEmployeeId: string | null;
        contractStart: Date;
        isStoreOwner: boolean;
        phone: string | null;
        bank: string | null;
        accountNumber: string | null;
        accountHolder: string | null;
        role: string;
        notes: string | null;
    }>;
    removeMemberWithSubordinates(employeeId: string): Promise<{
        removedCount: number;
        employeeIds: string[];
    }>;
    private collectSubordinateIds;
}
