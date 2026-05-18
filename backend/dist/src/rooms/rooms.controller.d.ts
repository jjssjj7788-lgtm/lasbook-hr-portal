import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    findAll(projectId?: string): Promise<({
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
    create(body: {
        projectId: number;
        name: string;
        managerId?: string;
    }, req: any): Promise<{
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
    update(id: string, body: any, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        managerId: string | null;
    }>;
    addMember(id: string, employeeId: string, req: any): Promise<{
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
    removeMember(id: string, employeeId: string, req: any): Promise<{
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
    removeMemberCascade(id: string, employeeId: string, req: any): Promise<{
        removedCount: number;
        employeeIds: string[];
    }>;
}
