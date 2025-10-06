export interface IBomItem {
  id?: string;
  itemCode: string;
  itemName: string;
  categoryId?: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  description?: string;
  supplier?: string;
}

export interface IBom {
  id?: string;
  name: string;
  categoryId?: number;
  description?: string;
  items: IBomItem[];
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface IBomListResponse {
  data: IBom[];
  count: number;
}

export interface ICreateBomRequest {
  name: string;
  categoryId?: number;
  description?: string;
  items: Omit<IBomItem, 'id'>[];
}

export interface IUpdateBomRequest extends ICreateBomRequest {
  id: string;
}

