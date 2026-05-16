import { PrismaService } from '../prisma/prisma.service';
export declare class CoursesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    create(data: {
        title: string;
        projectId: number;
        maxAttendees?: number;
        targetJobTypes?: string[];
    }): Promise<any>;
    enroll(courseId: number, userId: number): Promise<any>;
}
