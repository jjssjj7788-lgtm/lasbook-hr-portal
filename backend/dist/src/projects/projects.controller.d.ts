import { ProjectsService, ProductsService, PositionsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<({
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
    create(body: any, req: any): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any, req: any): import("@prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        name: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
        isActive: boolean;
    }[]>;
    create(body: any, req: any): import("@prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any, req: any): import("@prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deactivate(id: string, req: any): import("@prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        memberType: string;
        series: string;
        step: string | null;
        language: string;
        price: number;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export declare class PositionsController {
    private readonly positionsService;
    constructor(positionsService: PositionsService);
    findAll(projectId?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(body: any, req: any): import("@prisma/client").Prisma.Prisma__PositionClient<{
        id: number;
        name: string;
        projectId: number;
        code: string;
        fee1st: number;
        fee2nd: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: any, req: any): import("@prisma/client").Prisma.Prisma__PositionClient<{
        id: number;
        name: string;
        projectId: number;
        code: string;
        fee1st: number;
        fee2nd: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
