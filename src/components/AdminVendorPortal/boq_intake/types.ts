export type BOQDocumentStatus = "Uploaded" | "Extracting" | "Review Required" | "Draft RFP Created";

export interface PrincipalProvider {
  providerId: string;
  providerName: string;
  categoryCoverage: string[];
  brandsHandled: string[];
  country: string;
  contactPerson: string;
  email: string;
  status: "Active" | "Inactive";
  preferredVendor: boolean;
}

export interface ExtractedBOQLine {
  id: string;
  srNo: number;
  itemCode: string;
  itemName: string;
  category: string;
  subCategory: string;
  unit: string;
  quantity: number;
  remarks: string;
  confidence: number;
  suggestedProviderIds: string[];
  selectedProviderId: string;
  rfpGroup?: string;
}

export interface BOQExtractionResult {
  boqReferenceNo: string;
  demandNo: string;
  issuingDepartment: string;
  sourceAgency: string;
  closingDate: string;
  confidence: number;
  documentStatus: BOQDocumentStatus;
  lines: ExtractedBOQLine[];
}

export interface BOQUploadRecord {
  id: string;
  fileName: string;
  fileType: string;
  pages: number;
  uploadedBy: string;
  uploadedAt: string;
  status: BOQDocumentStatus;
}

export interface DraftRFP {
  id: string;
  draftNumber: string;
  title: string;
  providerId: string;
  providerName: string;
  category: string;
  boqReferenceNo: string;
  demandNo: string;
  sourceDocumentName: string;
  closingDate: string;
  submissionDeadline: string;
  deliveryTerms: string;
  warrantyPeriod: string;
  catalogueRequired: boolean;
  manufacturerCountryRequired: boolean;
  commercialTermsRequired: boolean;
  internalNotes: string;
  status: "Draft" | "Ready for Approval" | "Pending Approval";
  lines: ExtractedBOQLine[];
  createdAt: string;
  updatedAt: string;
}

export interface BOQIntakeSession {
  upload: BOQUploadRecord;
  extraction: BOQExtractionResult;
  drafts: DraftRFP[];
}

export interface LocalRFPListItem {
  id: string;
  draftId: string;
  tenderNumber: string;
  rfpTitle: string;
  buyerName: string;
  estimatedContractValue: number;
  estimatedContractValueLabel: string;
  status: number;
  sourceType: "BOQ_UPLOAD";
  createdAt: string;
}

export interface BOQRfpCreationHandoff {
  draftId: string;
  requestData: {
    rfpTitle: string;
    rfpDescription: string;
    purchaseRequisitionId: string;
    expressInterestLastDate: string;
    responseDueDate: string;
    clarificationDate: string;
    publishDate: string;
    closingDate: string;
    estimatedContractValue: number;
    sourceType: "BOQ_UPLOAD";
    sourceDocumentName: string;
    boqReferenceNo: string;
    demandNo: string;
    principalProviderId: string;
  };
  categoryNames: string[];
  categoryIds: number[];
  procurementItems: Array<{
    id: number;
    itemName: string;
    itemCode: string;
    quantity: number;
  }>;
  sourceFile?: File;
  sourceDocumentName: string;
  productsCreated: number;
  productsReused: number;
}
