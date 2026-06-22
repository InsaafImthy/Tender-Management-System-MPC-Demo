import { IBom } from "../../../types/bomTypes";

export type PortalStatus = "Draft" | "Published" | "Closed" | "Pending" | "Approved" | "Rejected" | string;

export interface CategoryOption {
  id: number;
  name: string;
}

export interface UploadedBoqFile {
  name: string;
  size: number;
  uploadedAt: string;
}

export interface BoqImportItem {
  id: string;
  lineNo: number;
  itemCode: string;
  itemName: string;
  categoryId?: number;
  quantity: number;
  unit: number;
  price: number;
  description?: string;
}

export interface PortalRfp {
  id: number;
  tenderNumber?: string;
  rfpTitle?: string;
  rfpDescription?: string;
  rfpCurrency?: string;
  categoryId?: number;
  categoryName?: string;
  status?: number | string;
  isPublished?: boolean;
  isOpen?: boolean;
  closingDate?: string;
  createdAt?: string;
  rfpItems?: Array<{ id?: number; itemName?: string; itemCode?: string; quantity?: number; unit?: number; price?: number }>;
}

export interface PortalInterest {
  id: number;
  rfpId?: number;
  rfpTitle?: string;
  tenderNumber?: string;
  vendorId?: number;
  vendorName?: string;
  status?: PortalStatus;
  createdAt?: string;
}

export interface PortalProposal {
  id: number;
  rfpId?: number;
  rfpTitle?: string;
  tenderNumber?: string;
  vendorId?: number;
  vendorCode?: string;
  vendorName?: string;
  bidAmount?: number;
  bidValidity?: number;
  status?: PortalStatus;
  submittedOn?: string;
  createdAt?: string;
  vendorRfpProposalItems?: Array<{ id?: number; rfpItemId?: number; amount?: number }>;
}

export interface PortalVendor {
  id: number;
  vendorCode?: string;
  organisationName?: string;
  vendorEmail?: string;
  mobile?: string;
  status?: number | string;
  isActive?: boolean;
  vendorCategories?: Array<{ id?: number; categoryId?: number; categoryName?: string; name?: string }>;
}

export interface VendorPortalState {
  uploadedFile?: UploadedBoqFile;
  boqItems: BoqImportItem[];
  categories: CategoryOption[];
  boms: IBom[];
  rfps: PortalRfp[];
  interests: PortalInterest[];
  proposals: PortalProposal[];
  vendors: PortalVendor[];
  loading: boolean;
  saving: boolean;
  error?: string;
}
