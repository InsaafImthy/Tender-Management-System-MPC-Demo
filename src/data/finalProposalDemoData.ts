import Cookies from "js-cookie";
import type { IFilterDto } from "../types/commonTypes";
import { RFP_STATUS } from "../utils/constants";
import type {
  ApprovalStepSource,
  DecisionPaperSource,
  FinalProposalRfpItemSource,
  SelectedProposalSource,
} from "../features/finalProposal/finalProposalTypes";

const DEMO_STORAGE_KEY = "mpc-final-proposal-demo-rfps-v1";
const DEMO_ID_START = 990001;

export interface DemoRfpRecord {
  id: number;
  createdBy: number;
  createdAt: string;
  status: number;
  tenderNumber: string;
  rfpTitle: string;
  rfpDescription: string;
  finalProposalDescription?: string;
  buyerName: string;
  buyerOrganizationName: string;
  departmentName: string;
  purchaseRequisitionId: string;
  rfpCurrency: string;
  estimatedContractValue: number;
  closingDate: string;
  isOpen: boolean;
  isSerial: boolean;
  rfpType: null;
  isLiveBiddingOn: null;
  rfpItems: FinalProposalRfpItemSource[];
  rfpDocuments: unknown[];
  rfpTechnicalDocuments: unknown[];
  rfpGeneralDocuments: unknown[];
  rfpOwners: unknown[];
  rfpCategories: unknown[];
  isDemoRecord: true;
  demoFinalProposalEditable: boolean;
  selectedProposals: SelectedProposalSource[];
  decisionPaper?: DecisionPaperSource;
  approvalSteps: ApprovalStepSource[];
}

export interface DemoFinalProposalInput {
  description?: string;
  itemValues: Array<{ rfpItemId: number; finalValue: number }>;
}

const approvalSteps = (rfpId: number): ApprovalStepSource[] => [
  {
    approverId: -1,
    status: RFP_STATUS.APPROVED,
    stepOrder: 1,
    approverName: "Demo Tender Committee",
    approverEmail: "demo.committee@mpc.demo",
    approverRole: "Commercial Approval",
    actionDate: "2026-09-18T10:09:00",
  },
  {
    approverId: -2,
    status: RFP_STATUS.APPROVED,
    stepOrder: 2,
    approverName: "Demo Final Approver",
    approverEmail: "demo.approver@mpc.demo",
    approverRole: "Authorized Approver",
    actionDate: "2026-09-19T14:09:00",
  },
].map((step, index) => ({ ...step, id: rfpId * 10 + index + 1 }));

const buildSelectedProposal = (
  rfpId: number,
  items: FinalProposalRfpItemSource[],
  values: number[],
): { proposals: SelectedProposalSource[]; decisionPaper: DecisionPaperSource } => {
  const proposalId = rfpId + 1_000_000;
  return {
    proposals: [
      {
        id: proposalId,
        bidAmount: values.reduce((total, value) => total + value, 0),
        vendorRfpProposalItems: items.map((item, index) => ({
          id: proposalId * 10 + index + 1,
          rfpItemId: item.id,
          amount: values[index],
          rfpItem: item,
        })),
      },
    ],
    decisionPaper: { vendorRfpProposalId: proposalId },
  };
};

const createDemoRecord = ({
  index,
  title,
  description,
  buyer,
  organisation,
  department,
  estimatedValue,
  items,
  finalValues,
}: {
  index: number;
  title: string;
  description: string;
  buyer: string;
  organisation: string;
  department: string;
  estimatedValue: number;
  items: Array<[string, string, number]>;
  finalValues?: number[];
}): DemoRfpRecord => {
  const id = DEMO_ID_START + index - 1;
  const rfpItems = items.map(([itemCode, itemName, quantity], itemIndex) => ({
    id: id * 10 + itemIndex + 1,
    itemCode,
    itemName,
    quantity,
  }));
  const selected = finalValues
    ? buildSelectedProposal(id, rfpItems, finalValues)
    : { proposals: [], decisionPaper: undefined };

  return {
    id,
    createdBy: 0,
    createdAt: `2026-09-${String(20 - index).padStart(2, "0")}T09:00:00`,
    status: RFP_STATUS.APPROVED,
    tenderNumber: `MPC-DEMO-${String(index).padStart(3, "0")}`,
    rfpTitle: title,
    rfpDescription: description,
    finalProposalDescription: finalValues
      ? `${description} This demonstration quotation reflects the final approved values for external tender submission.`
      : undefined,
    buyerName: buyer,
    buyerOrganizationName: organisation,
    departmentName: department,
    purchaseRequisitionId: `PR-DEMO-2026-${String(index).padStart(3, "0")}`,
    rfpCurrency: "OMR",
    estimatedContractValue: estimatedValue,
    closingDate: `2026-${index < 5 ? "11" : "12"}-${String(10 + index).padStart(2, "0")}T17:00:00`,
    isOpen: false,
    isSerial: true,
    rfpType: null,
    isLiveBiddingOn: null,
    rfpItems,
    rfpDocuments: [],
    rfpTechnicalDocuments: [],
    rfpGeneralDocuments: [],
    rfpOwners: [],
    rfpCategories: [],
    isDemoRecord: true,
    demoFinalProposalEditable: !finalValues,
    selectedProposals: selected.proposals,
    decisionPaper: selected.decisionPaper,
    approvalSteps: approvalSteps(id),
  };
};

const initialDemoRecords: DemoRfpRecord[] = [
  createDemoRecord({
    index: 1,
    title: "Annual Pharmaceutical Supply for Primary Care Facilities",
    description: "Supply and delivery of essential pharmaceutical products to primary care facilities across Muscat.",
    buyer: "Directorate of Primary Healthcare",
    organisation: "Ministry of Health",
    department: "Central Procurement",
    estimatedValue: 45_000,
    items: [
      ["MED-AMOX-500", "Amoxicillin 500 mg capsules", 5_000],
      ["MED-PARA-500", "Paracetamol 500 mg tablets", 12_000],
      ["MED-OMEP-20", "Omeprazole 20 mg capsules", 4_000],
    ],
    finalValues: [11_250, 9_600, 8_400],
  }),
  createDemoRecord({
    index: 2,
    title: "Laboratory Reagents and Diagnostic Consumables",
    description: "Framework supply of laboratory reagents, sample collection products, and diagnostic consumables.",
    buyer: "Royal Hospital Laboratory",
    organisation: "Royal Hospital",
    department: "Laboratory Services",
    estimatedValue: 82_500,
    items: [
      ["LAB-CBC-100", "Complete blood count reagent kit", 180],
      ["LAB-CHEM-50", "Clinical chemistry reagent pack", 240],
      ["LAB-TUBE-EDTA", "EDTA blood collection tubes", 15_000],
      ["LAB-TIP-200", "Universal pipette tips", 20_000],
    ],
    finalValues: [21_600, 28_800, 4_500, 5_800],
  }),
  createDemoRecord({
    index: 3,
    title: "Hospital Medical Consumables Supply Agreement",
    description: "Supply of high-use sterile medical consumables for inpatient and outpatient clinical services.",
    buyer: "Hospital Procurement Team",
    organisation: "Muscat Healthcare Group",
    department: "Clinical Supplies",
    estimatedValue: 68_000,
    items: [
      ["CON-SYR-10", "Sterile 10 ml syringes", 25_000],
      ["CON-GLOVE-M", "Nitrile examination gloves medium", 40_000],
      ["CON-IV-20", "Peripheral IV cannula 20G", 8_000],
      ["CON-GAUZE-10", "Sterile gauze swabs 10 x 10 cm", 30_000],
    ],
    finalValues: [7_500, 16_000, 12_800, 9_000],
  }),
  createDemoRecord({
    index: 4,
    title: "Cold Chain and Temperature-Controlled Pharmacy Supplies",
    description: "Provision of validated cold-chain packaging and temperature monitoring supplies for pharmaceutical distribution.",
    buyer: "Medical Stores Directorate",
    organisation: "Public Health Supply Authority",
    department: "Warehouse and Distribution",
    estimatedValue: 39_500,
    items: [
      ["CC-BOX-20", "Validated cold-chain transport box 20 L", 350],
      ["CC-LOGGER", "Single-use temperature data logger", 1_000],
      ["CC-GEL-500", "Conditioned gel pack 500 g", 4_000],
    ],
    finalValues: [15_750, 8_500, 6_000],
  }),
  createDemoRecord({
    index: 5,
    title: "Oncology Support Medicines - Final Pricing Entry",
    description: "Supply of oncology supportive-care medicines for specialist treatment units.",
    buyer: "National Oncology Centre",
    organisation: "Specialist Care Directorate",
    department: "Oncology Pharmacy",
    estimatedValue: 95_000,
    items: [
      ["ONC-OND-8", "Ondansetron 8 mg injection", 1_200],
      ["ONC-FIL-300", "Filgrastim 300 mcg prefilled syringe", 600],
      ["ONC-MES-400", "Mesna 400 mg injection", 800],
    ],
  }),
  createDemoRecord({
    index: 6,
    title: "Point-of-Care Diagnostic Equipment - Final Pricing Entry",
    description: "Supply, installation, and commissioning of point-of-care diagnostic equipment and starter consumables.",
    buyer: "Diagnostic Services Committee",
    organisation: "Regional Hospitals Directorate",
    department: "Biomedical Engineering",
    estimatedValue: 120_000,
    items: [
      ["POC-ANL-01", "Point-of-care blood gas analyser", 4],
      ["POC-CART-50", "Blood gas test cartridge pack", 240],
      ["POC-QC-01", "Quality control solution kit", 36],
    ],
  }),
  createDemoRecord({
    index: 7,
    title: "Sterile Surgical Supplies - Final Pricing Entry",
    description: "Supply of sterile surgical procedure packs and associated theatre consumables.",
    buyer: "Surgical Services Procurement",
    organisation: "Muscat General Hospital",
    department: "Operating Theatres",
    estimatedValue: 74_000,
    items: [
      ["SUR-PACK-GEN", "General surgery sterile procedure pack", 1_500],
      ["SUR-GOWN-L", "Reinforced sterile surgical gown large", 3_000],
      ["SUR-DRAPE-01", "Universal sterile surgical drape", 2_500],
      ["SUR-BLADE-22", "Sterile surgical blade size 22", 5_000],
    ],
  }),
  createDemoRecord({
    index: 8,
    title: "Pharmacy Automation Consumables - Final Pricing Entry",
    description: "Supply of labels, packaging, and consumables compatible with automated pharmacy dispensing systems.",
    buyer: "Pharmacy Operations Team",
    organisation: "Integrated Care Network",
    department: "Pharmacy Automation",
    estimatedValue: 52_000,
    items: [
      ["AUT-LBL-50", "Thermal prescription labels 50 x 30 mm", 250_000],
      ["AUT-BAG-S", "Automated dispensing paper bags small", 80_000],
      ["AUT-RIB-110", "Thermal transfer ribbon 110 mm", 400],
    ],
  }),
];

const cloneInitialRecords = (): DemoRfpRecord[] =>
  JSON.parse(JSON.stringify(initialDemoRecords)) as DemoRfpRecord[];

const readRecords = (): DemoRfpRecord[] => {
  if (typeof window === "undefined") return cloneInitialRecords();
  try {
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!stored) {
      const seeded = cloneInitialRecords();
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(stored) as DemoRfpRecord[];
    return Array.isArray(parsed) && parsed.length === 8 ? parsed : cloneInitialRecords();
  } catch {
    return cloneInitialRecords();
  }
};

const writeRecords = (records: DemoRfpRecord[]) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(records));
  }
};

const currentUserId = () => Number(Cookies.get("userId") || 0);

const withCurrentOwner = (record: DemoRfpRecord): DemoRfpRecord => ({
  ...record,
  createdBy: currentUserId(),
});

export const isDemoRfpId = (id: number) =>
  id >= DEMO_ID_START && id < DEMO_ID_START + initialDemoRecords.length;

export const getDemoRfpById = (id: number): DemoRfpRecord | undefined => {
  const record = readRecords().find((item) => item.id === id);
  return record ? withCurrentOwner(record) : undefined;
};

export const getDemoRfps = (filter?: IFilterDto): DemoRfpRecord[] => {
  let records = readRecords().map(withCurrentOwner);
  for (const field of filter?.fields ?? []) {
    const column = field.columnName.toLowerCase();
    if (column === "status") {
      records = records.filter((record) => record.status === Number(field.value));
    } else if (column === "createdby") {
      records = records.filter((record) => record.createdBy === Number(field.value));
    } else if (column === "assigned_rfps") {
      records = [];
    }
  }

  const search = filter?.globalSearch?.trim().toLowerCase();
  if (search) {
    records = records.filter((record) =>
      `${record.tenderNumber} ${record.rfpTitle} ${record.buyerName}`
        .toLowerCase()
        .includes(search),
    );
  }
  return records;
};

export const getDemoSelectedProposals = (rfpId: number): SelectedProposalSource[] =>
  getDemoRfpById(rfpId)?.selectedProposals ?? [];

export const getDemoDecisionPaper = (rfpId: number): DecisionPaperSource | undefined =>
  getDemoRfpById(rfpId)?.decisionPaper;

export const getDemoApprovalSteps = (rfpId: number): ApprovalStepSource[] =>
  getDemoRfpById(rfpId)?.approvalSteps ?? [];

export const saveDemoFinalProposal = (
  rfpId: number,
  input: DemoFinalProposalInput,
): DemoRfpRecord => {
  const records = readRecords();
  const index = records.findIndex((record) => record.id === rfpId);
  if (index < 0) throw new Error("Demo RFP not found.");
  const record = records[index];
  if (input.itemValues.length !== record.rfpItems.length) {
    throw new Error("Enter a final value for every BOQ item.");
  }

  const values = record.rfpItems.map((item) => {
    const value = input.itemValues.find((entry) => entry.rfpItemId === item.id)?.finalValue;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new Error("Every BOQ item must have a final value greater than zero.");
    }
    return value;
  });
  const selected = buildSelectedProposal(rfpId, record.rfpItems, values);
  const updated: DemoRfpRecord = {
    ...record,
    finalProposalDescription: input.description?.trim() || record.rfpDescription,
    selectedProposals: selected.proposals,
    decisionPaper: selected.decisionPaper,
  };
  records[index] = updated;
  writeRecords(records);
  return withCurrentOwner(updated);
};

export const publishDemoRfp = (rfpId: number): DemoRfpRecord => {
  return updateDemoRfpStatus(rfpId, RFP_STATUS.PUBLISHED);
};

export const updateDemoRfpStatus = (
  rfpId: number,
  status: number,
): DemoRfpRecord => {
  const records = readRecords();
  const index = records.findIndex((record) => record.id === rfpId);
  if (index < 0) throw new Error("Demo RFP not found.");
  records[index] = { ...records[index], status };
  writeRecords(records);
  return withCurrentOwner(records[index]);
};
