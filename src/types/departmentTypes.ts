export interface IDepartment {
    id?: string,
    createdAt?: string
    createdBy?: string
    updatedAt?: string
    updatedBy?: string
    clientId?: string
    departmentName?: string
    departmentCode?: string
}

export interface IDepartmentBudget {
    id?: string
    createdAt?: string
    createdBy?: string
    updatedAt?: string
    updatedBy?: string
    clientId?: string
    departmentId?: string,
    currency?:string
    amount?: number
}

export interface ICostCategory {
    id: string; 
    createdAt: string;
    createdBy: string; 
    updatedAt: string; 
    updatedBy: string; 
    categoryName: string; 
}

export interface IStatus {
   
}
