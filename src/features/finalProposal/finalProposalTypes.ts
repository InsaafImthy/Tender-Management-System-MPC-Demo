export interface FinalProposalRfpItemSource {
  id?: number;
  itemCode?: string;
  itemName?: string;
  quantity?: number;
}

export interface FinalProposalRfpSource {
  id?: number;
  status?: number;
  tenderNumber?: string;
  rfpTitle?: string;
  rfpDescription?: string;
  buyerName?: string;
  buyerOrganizationName?: string;
  departmentName?: string;
  purchaseRequisitionId?: string;
  rfpCurrency?: string;
  estimatedContractValue?: number;
  closingDate?: string;
  rfpItems?: FinalProposalRfpItemSource[];
  finalProposalDescription?: string;
  isDemoRecord?: boolean;
  demoFinalProposalEditable?: boolean;
}

export interface SelectedProposalItemSource {
  id?: number;
  rfpItemId?: number;
  amount?: number;
  rfpItem?: FinalProposalRfpItemSource;
}

export interface SelectedProposalSource {
  id?: number;
  bidAmount?: number;
  vendorRfpProposalItems?: SelectedProposalItemSource[];
}

export interface DecisionPaperSource {
  vendorRfpProposalId?: number;
}

export interface ApprovalStepSource {
  id?: number;
  approverId?: number;
  status?: number;
  stepOrder?: number;
  approverName?: string;
  approverEmail?: string;
  approverRole?: string;
  actionDate?: string;
}

export interface ElectronicSignature {
  type: "demo";
  signedBy: string;
  designation: string;
  signedAt: string;
  verificationText: string;
}

export interface FinalApprovalDetails {
  approvedBy?: string;
  approvalRole?: string;
  approvalDate?: string;
}

export interface FinalProposalItem {
  productCode: string;
  name: string;
  quantity: number;
  finalValue: number;
}

export interface FinalProposalDocument {
  tenderNumber: string;
  tenderTitle: string;
  description?: string;
  buyerName?: string;
  buyerOrganization?: string;
  department?: string;
  purchaseRequisitionId?: string;
  currency: string;
  estimatedContractValue?: number;
  finalBidValue: number;
  closingDate?: string;
  items: FinalProposalItem[];
  approval?: FinalApprovalDetails;
  generatedAt: string;
  signature: ElectronicSignature;
}

export interface FinalProposalSourceData {
  rfp: FinalProposalRfpSource;
  selectedProposals: SelectedProposalSource[];
  decisionPaper?: DecisionPaperSource;
  approvalSteps?: ApprovalStepSource[];
}

export interface FinalProposalReadiness {
  ready: boolean;
  reason?: string;
  document?: FinalProposalDocument;
}
