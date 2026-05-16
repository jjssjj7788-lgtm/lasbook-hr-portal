import { PrismaService } from '../prisma/prisma.service';
export declare class SessionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    createLecture(data: {
        title: string;
        topic?: string;
        location?: string;
        startTime: Date;
        endTime: Date;
        maxAttendees?: number;
        posters?: string;
        targetJobTypes?: string[];
    }): Promise<any>;
    update(id: number, data: {
        title?: string;
        topic?: string;
        location?: string;
        startTime?: Date;
        endTime?: Date;
        maxAttendees?: number;
        posters?: string;
    }): Promise<any>;
    remove(id: number): Promise<any>;
    generateQr(sessionId: number): Promise<{
        qrToken: any;
    }>;
    revokeQr(sessionId: number): Promise<{
        message: string;
    }>;
    private ensureDefaultProject;
}
