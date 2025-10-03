export interface ICategory {
  id: number;
  name: string;
  description: string;
  clientId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isdeleted?: boolean;
  deletedBy?: number;
  tenantId?: number;
  companyId?: number;
  branchId?: number;
}
