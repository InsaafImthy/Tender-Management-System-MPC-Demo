export interface IPurchaseRequisitionItem {
  id?: number;
  itemCode: string;
  itemName: string;
  description?: string;
  unit: number;
  requestedQuantity: number;
  estimatedCost: number;
}

export interface IPurchaseRequisition {
  id?: number;
  requisitionNumber?: string;
  requisitionTitle: string;
  departmentId: number;
  department?: any;
  requestedBy?: string;
  requestedById?: number;
  priority: number;
  requiredDate: string;
  notes?: string;
  items: IPurchaseRequisitionItem[];
  selectedBoms?: any[];
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface IPurchaseRequisitionListResponse {
  data: IPurchaseRequisition[];
  count: number;
}

export interface ICreatePurchaseRequisitionRequest {
  requisitionTitle: string;
  departmentId: number;
  requestedById?: number;
  priority: number;
  requiredDate: string;
  notes?: string;
  items: Omit<IPurchaseRequisitionItem, 'id'>[];
}

export interface IUpdatePurchaseRequisitionRequest extends ICreatePurchaseRequisitionRequest {
  id: number;
}

export enum PurchaseRequisitionPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export enum PurchaseRequisitionStatus {
  Draft = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  PartiallyFulfilled = 4,
  Fulfilled = 5
}

