export interface IBomItem {
  id?: number;
  itemCode: string;
  itemName: string;
  categoryId?: number;
  quantity: number;
  unit: number;
  price: number;
  description?: string;
  supplier?: string;
}

export interface IBom {
  id?: number;
  bomName: string;
  categoryId?: number;
  category?: { id?: number; name?: string };
  description?: string;
  bomItemDtos: IBomItem[];
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
  bomName: string;
  categoryId?: number;
  description?: string;
  bomItemDtos: Omit<IBomItem, 'id'>[];
}

export interface IUpdateBomRequest extends ICreateBomRequest {
  id: number;
}
