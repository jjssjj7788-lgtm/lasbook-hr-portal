import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmployeeId(employeeId: string): Promise<({
        project: {
            id: number;
            name: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }) | null>;
    findAll(requesterId: string, projectId?: number): Promise<({
        project: {
            id: number;
            name: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        position: {
            id: number;
            name: string;
            projectId: number;
            code: string;
            fee1st: number;
            fee2nd: number;
        };
        parent: {
            name: string;
            employeeId: string;
        } | null;
    } & {
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        employeeId: string;
        positionId: number;
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
    })[]>;
    findOne(employeeId: string, requesterId: string): Promise<({
        sales: ({
            product: {
                id: number;
                memberType: string;
                series: string;
                step: string | null;
                language: string;
                price: number;
                isActive: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            employeeId: string;
            notes: string | null;
            saleDate: Date;
            customerName: string;
            paymentMethod: string;
            actualAmount: number;
            deductedFee: number;
            netAmount: number;
            salesWeek: number;
            productId: number;
        })[];
        activityReports: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            employeeId: string;
            submittedAt: Date;
            prospectCount: number;
            counselContent: string | null;
            specialNotes: string | null;
            adminEvaluation: string | null;
        }[];
        activityFees: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            employeeId: string;
            payMonth: string;
            netAmount: number;
            paymentRound: number;
            grossAmount: number;
            isEligible: boolean;
            paymentStatus: string;
            paidAt: Date | null;
        }[];
        commissions: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            projectId: number;
            employeeId: string;
            settlementMonth: string;
            performanceRate: number;
            subsidy: number;
            netAmount: number;
            paymentStatus: string;
            paidAt: Date | null;
            salesCount: number;
            netSalesTotal: number;
            achievementGrade: string | null;
            performanceBonus: number;
            totalGross: number;
            firstPaymentDue: Date | null;
        }[];
        project: {
            id: number;
            name: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        position: {
            id: number;
            name: string;
            projectId: number;
            code: string;
            fee1st: number;
            fee2nd: number;
        };
        parent: {
            name: string;
            employeeId: string;
        } | null;
        subordinates: ({
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
        traineeAttendances: ({
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
        })[];
    } & {
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        employeeId: string;
        positionId: number;
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
    }) | null>;
    create(data: {
        employeeId: string;
        projectId: number;
        positionId: number;
        name: string;
        password: string;
        parentEmployeeId?: string;
        contractStart: Date;
        isStoreOwner?: boolean;
        phone?: string;
        bank?: string;
        accountNumber?: string;
        accountHolder?: string;
        role?: string;
        notes?: string;
    }): Promise<{
        project: {
            id: number;
            name: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
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
    update(employeeId: string, data: Partial<{
        name: string;
        positionId: number;
        parentEmployeeId: string;
        contractStart: Date;
        isStoreOwner: boolean;
        phone: string;
        bank: string;
        accountNumber: string;
        accountHolder: string;
        role: string;
        notes: string;
        isActive: boolean;
    }>): Promise<{
        project: {
            id: number;
            name: string;
            description: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
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
    resetPassword(employeeId: string, newPassword: string): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        employeeId: string;
        positionId: number;
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
    changePassword(employeeId: string, oldPassword: string, newPassword: string): Promise<{
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        isActive: boolean;
        employeeId: string;
        positionId: number;
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
}
