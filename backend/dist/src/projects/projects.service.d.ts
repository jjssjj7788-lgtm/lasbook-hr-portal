import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__ProjectClient<({
        positions: {
            id: number;
            name: string;
            projectId: number;
            code: string;
            fee1st: number;
            fee2nd: number;
        }[];
        users: {
            name: string;
            employeeId: string;
            role: string;
        }[];
    } & {
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(data: {
        name: string;
        description?: string;
    }): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: {
        name?: string;
        description?: string;
        status?: string;
    }): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        isActive: boolean;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
    }[]>;
    create(data: {
        memberType: string;
        series: string;
        step?: string;
        language: string;
        price: number;
    }): import("@prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        isActive: boolean;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        isActive: boolean;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deactivate(id: number): import("@prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        isActive: boolean;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deactivateZeroPriced(): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
}
export declare class PositionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(projectId?: number): import("@prisma/client").Prisma.PrismaPromise<({
        project: {
            name: string;
        };
    } & {
        id: number;
        name: string;
        projectId: number;
        code: string;
        fee1st: number;
        fee2nd: number;
    })[]>;
    create(data: {
        projectId: number;
        name: string;
        code: string;
        fee1st: number;
        fee2nd: number;
    }): import("@prisma/client").Prisma.Prisma__PositionClient<{
        id: number;
        name: string;
        projectId: number;
        code: string;
        fee1st: number;
        fee2nd: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: {
        name?: string;
        fee1st?: number;
        fee2nd?: number;
    }): import("@prisma/client").Prisma.Prisma__PositionClient<{
        id: number;
        name: string;
        projectId: number;
        code: string;
        fee1st: number;
        fee2nd: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
