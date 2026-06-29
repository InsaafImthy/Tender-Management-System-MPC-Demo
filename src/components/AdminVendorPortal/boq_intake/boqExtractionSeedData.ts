import { BOQExtractionResult, ExtractedBOQLine } from "./types";

type SeedLine = Pick<ExtractedBOQLine, "itemCode" | "itemName" | "unit" | "quantity" | "remarks">;

const surgicalLineTuples: [string, string, string, number, string][] = [
  ["060R0001785", "PHOENIX GRAM NEGATIVE / ID-94 CAT:449042", "Nos.", 220, "Need in 2 lots: 110 boxes with offer, 110 boxes after 4 months"],
  ["060R0001786", "PHOENIX GRAM POSITIVE / ID-69 CAT:449064", "Nos.", 80, "Need in 2 lots: 40 boxes with offer, 40 boxes after 4 months"],
  ["060R0001787", "PHOENIX STREPTOCOCCUS / ID-11 CAT:448785", "Nos.", 6, "Need in 2 lots: 3 boxes with offer, 3 boxes after 4 months"],
  ["060R0001789", "PHOENIX YEAST / ID CAT:448316", "Nos.", 1, "Need with offer"],
  ["060R0001792", "PHOENIX ID BROTH 100 TESTS CAT:246001", "Kit", 80, "Need in 2 lots: 40 boxes with offer, 40 boxes after 4 months"],
  ["060R0001794", "PHOENIX AST BROTH 100 TESTS CAT:246003", "Kit", 80, "Need in 2 lots: 40 boxes with offer, 40 boxes after 4 months"],
  ["060R0001791", "PHOENIX AST-S BROTH 100 TUBE/KIT CAT:246007", "Kit", 3, "Need in 2 lots: 2 boxes with offer, 1 box after 4 months"],
  ["060R0001795", "PHOENIX AST INDICATOR", "Kit", 3, "Need in 2 lots: 2 boxes with offer, 1 box after 4 months"],
  ["060R0001793", "PHOENIX AST-S INDICATOR 10*6 ML CAT:246009", "Kit", 1, "Need with offer"],
  ["060R0001764", "PHOENIX AP AST INDICATOR 10*15 ML CAT:246006", "Kit", 6, "Need in 2 lots: 3 boxes with offer, 3 boxes after 4 months"],
  ["060R0001760", "PHOENIX AP WASTE TIP 25 TIP/KIT CAT:448013", "Kit", 1, "Need with offer"],
  ["060R0001762", "PHOENIX AP WASTE LIQUID BOTTLE 10 BTL/KIT CAT:448014", "Kit", 1, "Need with offer"],
  ["060R0001761", "PHOENIX AP DISPENSE TUBING SET 5/KIT CAT:448015", "Kit", 4, "Need in 2 lots: 2 boxes with offer, 2 boxes after 4 months"],
  ["060R0001763", "PHOENIX AP ID SOLUTION 5*800 ML CAT:448012", "Kit", 4, "Need in 2 lots: 2 boxes with offer, 2 boxes after 4 months"],
  ["060R0001765", "PHOENIX AP PIPETTE TIPS 960 TIP/KIT CAT:448038", "Kit", 17, "Need in 2 lots: 10 boxes with offer, 7 boxes after 4 months"],
  ["060R0001796", "BD PHOENIX SPECT TM CALIBRATION STANDARDS CAT:440911", "Packet", 1, "Need with offer"],
  ["060D0000076", "IVD BACTERIAL TEST STANDARD (BTS) CAT:8290190", "Pack", 3, "Need in 2 lots: 2 boxes with offer, 1 box after 4 months"],
  ["060R0001767", "HCCA MATRIX 2000 TEST/KIT CAT:8290200", "Kit", 5, "Need in 2 lots: 3 boxes with offer, 2 boxes after 4 months"],
];

const surgicalLines: SeedLine[] = surgicalLineTuples.map(([itemCode, itemName, unit, quantity, remarks]) => ({
  itemCode,
  itemName,
  unit,
  quantity,
  remarks,
}));

const medicalEquipmentLines: SeedLine[] = [
  { itemCode: "06124", itemName: "APHERESIS MACHINE", unit: "Nos.", quantity: 2, remarks: "New Sumail Hospital; supply, installation, commissioning and end-user training" },
  { itemCode: "11757", itemName: "BLOOD AND COMPONENT TRANSPORT BOXES (SMALL, MEDIUM, AND LARGE)", unit: "Set", quantity: 4, remarks: "High-quality insulated transport boxes for blood products" },
  { itemCode: "04883", itemName: "PATIENT CHAIR WITH ADJUSTABLE ARM REST AND COLLAPSIBLE SIDE RAILS", unit: "Nos.", quantity: 2, remarks: "Tilting head and foot to 22 degrees" },
  { itemCode: "04866", itemName: "HAEMOGLOBINOMETER, COMPLETE WITH CONSUMABLES", unit: "Nos.", quantity: 2, remarks: "Consumables required for 100 samples per unit" },
  { itemCode: "10619", itemName: "IRRADIATOR, BLOOD, X-RAY", unit: "Nos.", quantity: 1, remarks: "X-ray irradiation system for whole blood or blood components" },
  { itemCode: "09787", itemName: "WELDER, TUBE, STERILE", unit: "Nos.", quantity: 2, remarks: "Include consumables for at least 500 procedures" },
  { itemCode: "08555", itemName: "BED, DELIVERY, ELECTRICAL", unit: "Nos.", quantity: 8, remarks: "Electrical delivery bed for New Sumail Hospital" },
  { itemCode: "OT-12533", itemName: "TROLLEY, PATIENT, VARIABLE HEIGHT", unit: "Nos.", quantity: 6, remarks: "Height-adjustable patient transport trolley" },
];

const genericLines: SeedLine[] = [
  { itemCode: "GEN-001", itemName: "MEDICAL EXAMINATION GLOVES", unit: "Box", quantity: 120, remarks: "Powder-free; assorted sizes" },
  { itemCode: "GEN-002", itemName: "DISPOSABLE SURGICAL MASK", unit: "Box", quantity: 80, remarks: "Three-ply medical grade" },
  { itemCode: "GEN-003", itemName: "STERILE SYRINGE 10 ML", unit: "Pack", quantity: 60, remarks: "Individual sterile packaging" },
  { itemCode: "GEN-004", itemName: "PATIENT MONITOR", unit: "Nos.", quantity: 4, remarks: "Multi-parameter bedside monitoring" },
  { itemCode: "GEN-005", itemName: "DRESSING SET", unit: "Set", quantity: 30, remarks: "Sterile general dressing set" },
];

const toLines = (lines: SeedLine[]): ExtractedBOQLine[] => lines.map((line, index) => ({
  ...line,
  id: `line-${index + 1}`,
  srNo: index + 1,
  category: "",
  subCategory: "",
  confidence: 0,
  suggestedProviderIds: [],
  selectedProviderId: "",
}));

export const getBOQExtractionSeed = (fileName: string): BOQExtractionResult => {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("surgical")) {
    return {
      boqReferenceNo: "Lab/Q/2026/00118 / 41103",
      demandNo: "LMIC/Lab/D/URG/26/00003",
      issuingDepartment: "Finance Department, Directorate General of Royal Hospital",
      sourceAgency: "Ministry of Health, Sultanate of Oman",
      closingDate: "2026-06-13",
      confidence: 96,
      documentStatus: "Review Required",
      lines: toLines(surgicalLines),
    };
  }

  if (normalized.includes("medical equipment")) {
    return {
      boqReferenceNo: "DMT/SUMAIL/1746/1215-PH1",
      demandNo: "DMT-ME-2026-1746",
      issuingDepartment: "Directorate of Medical Technologies (DMT)",
      sourceAgency: "Ministry of Health, Sultanate of Oman",
      closingDate: "2026-07-30",
      confidence: 92,
      documentStatus: "Review Required",
      lines: toLines(medicalEquipmentLines),
    };
  }

  return {
    boqReferenceNo: `BOQ/${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`,
    demandNo: `DEMAND/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`,
    issuingDepartment: "Central Procurement Department",
    sourceAgency: "Ministry of Health, Sultanate of Oman",
    closingDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    confidence: 78,
    documentStatus: "Review Required",
    lines: toLines(genericLines),
  };
};

export const getPageCount = (fileName: string) => {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("surgical")) return 4;
  if (normalized.includes("medical equipment")) return 159;
  return 6;
};
