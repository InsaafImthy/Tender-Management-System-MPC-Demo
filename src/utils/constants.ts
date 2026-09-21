export const currencies = [
  { label: "OMR", value: "OMR" },
];

export const commonUnits = [
    {label: "Packs", value: 0},
    {label: "Strips", value: 1},
    {label: "Bottles", value: 2},
    {label: "Vials", value: 3},
    {label: "Kilograms", value: 4},
    {label: "Cartons", value: 5},
    {label: "Liters", value: 6},
    {label: "Hours", value: 7},
]

export const questionTypesList = [
  {label: "Text", value: 0},
  {label: "TextArea", value: 1},
  {label: "Boolean", value: 2}
]

export const currenciesWithLabel = [
  { label: "OMR (Omani Rial)", value: "OMR" },
];

export const defaultFilter = {
  fields: [],
  pageNo: 0,
  pageSize: 0,
  sortColumn: "CreatedAt",
  sortDirection: "DESC",
};

export const tenderFilter = {
  id: 0,
  title: "",
  description: "",
  publishingDate: "",
  categories: [],
  pageNo: 1,
  pageSize: 10,
  sortColumn: "CreatedAt",
  sortDirection: "DESC",
};

// rfp column labels for table
export const rfp_column_labels = {
  tenderNumber: "ID",
  rfpTitle: "Tender Title",
  buyerName: "Buyer",
  estimatedContractValueLabel: "Estd. Con Value",
  status: "Status",
};

export const costSummuryColumnLabels = {
  categoryName: "Category",
  estimatedAmount: "Amount",
  description: "Description",
};
export const costSummuryColumns = [
  "categoryName",
  "estimatedAmount",
  "description",
];

export const quotesColumnLabels = {
  vendorName: "Vendor name",
  amount: "Amount",
  attachmentComponent: "Attachment",
};
export const quotesColumns = ["vendorName", "amount", "attachmentComponent"];

export const project_column_labels = {
  projectId: "ID",
  projectName: "Pharmacy Program",
  departmentName: "Department",
  approvedBudgetLabel: "Approved Budget",
  status: "Status",
};
// for sorting table
export const rfp_sorting_fields = {
  tenderNumber: "ID",
  rfpTitle: "RFP Title",
  buyerName: "Buyer",
  bidValue: "Bid Value",
  status: "Status",
};

export const vendor_sorting_fields = {
  vendorCode: "ID",
  organisationName: "Organization Name",
  status: "Status",
};

export const upcoming_tendor_sorting_fields = {
  Title: "Title",
  publishingDate: "Tender Publishing Date",
};

export const  delivery_details_sorting_fields = {
  poNumber: "PO Number",
  supplierName: "Supplier Name",
  deliveryDate: "Delivery Date",
  deliveryLocation: "Delivery Location",
  projectSite: "Pharmacy/Warehouse Location"
};

export const project_sorting_fields = {
  projectId: "ID",
  projectName: "Pharmacy Program",
  approvedBudget: "Approved Budget",
  status: "Status",
};

export const projectStatuses = [
  { label: "Completed", value: "completed" },
  { label: "On hold", value: "on_hold" },
  { label: "Not started", value: "not_started" },
  { label: "In progress", value: "in_progress" },
];

export const milestoneStatuses = [
  { label: "Completed", value: "completed" },
  { label: "Delayed", value: "delayed" },
  { label: "On track", value: "on_track" },
];

export const RFP_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  UNDER_CLARIFICATION: 3,
  UNDER_APPROVAL: 4,
  PUBLISHED: 5,
  CLOSED: 6,
  PENDING_PROPOSAL: 7,
  UNDER_RFP_OPEN: 8,
  UNDER_EVALUATION: 9,
  UNDER_AWARD: 10,
} as const;

export const rfpStatuses = [
  { label: "Pending", value: RFP_STATUS.PENDING },
  { label: "Approved", value: RFP_STATUS.APPROVED },
  { label: "Rejected", value: RFP_STATUS.REJECTED },
  { label: "Under Clarification", value: RFP_STATUS.UNDER_CLARIFICATION },
  { label: "Under Approval", value: RFP_STATUS.UNDER_APPROVAL },
  { label: "Published", value: RFP_STATUS.PUBLISHED },
  { label: "Closed", value: RFP_STATUS.CLOSED },
  { label: "Pending", value: RFP_STATUS.PENDING_PROPOSAL },
  { label: "Under RFP Open", value: RFP_STATUS.UNDER_RFP_OPEN },
  { label: "Under Evaluation", value: RFP_STATUS.UNDER_EVALUATION },
  { label: "Under Award", value: RFP_STATUS.UNDER_AWARD },
];

export const documentTypeConst = {
  technical: 1,
  commercial: 2,
  general: 3,
};
