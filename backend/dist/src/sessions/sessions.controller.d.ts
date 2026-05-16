import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    getAll(): Promise<any>;
    getOne(id: string): Promise<any>;
    createLecture(body: any, files: Express.Multer.File[]): Promise<any>;
    update(id: string, body: any, files: Express.Multer.File[]): Promise<any>;
    remove(id: string): Promise<any>;
    generateQr(id: string): Promise<{
        qrToken: any;
    }>;
    revokeQr(id: string): Promise<{
        message: string;
    }>;
}
