import { CoursesService } from './courses.service';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    getAll(): Promise<any>;
    create(body: {
        title: string;
        projectId: number;
        maxAttendees?: number;
        targetJobTypes?: string[];
    }): Promise<any>;
    enroll(id: string, req: any): Promise<any>;
}
