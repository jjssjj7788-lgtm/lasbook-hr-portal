import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findAll(req: any, projectId?: string, traineeId?: string, month?: string): Promise<({
        project: {
            name: string;
        };
        trainee: {
            name: string;
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
            employeeId: string;
        };
        mentor: {
            name: string;
            employeeId: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    })[]>;
    getTransportSummary(projectId: string, month: string): Promise<{
        summary: {
            name: string;
            count: number;
            gross: number;
            net: number;
            bank: string;
            accountNumber: string;
            accountHolder: string;
        }[];
        lines: string[];
    }>;
    create(body: any): Promise<{
        trainee: {
            name: string;
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        };
        mentor: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    }>;
    update(id: string, body: any, req: any): Promise<{
        trainee: {
            name: string;
            position: {
                id: number;
                name: string;
                projectId: number;
                code: string;
                fee1st: number;
                fee2nd: number;
            };
        };
        mentor: {
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    }>;
    delete(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        notes: string | null;
        educationDate: Date;
        branchName: string;
        branchLabel: string;
        isPresent: boolean;
        transportFee: number;
        traineeId: string;
        mentorId: string;
    }>;
}
