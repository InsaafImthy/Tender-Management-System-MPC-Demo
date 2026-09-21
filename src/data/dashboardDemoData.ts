import { DashboardTender } from "../types/dashboardTypes";

export const DASHBOARD_DEMO_CURRENCY = "OMR";

const DEMO_STATUSES = [5, 5, 5, 5, 5, 9, 9, 9, 4, 10, 1, 6, 6, 3, 8, 0, 5];
const DEMO_BUYERS = [
  "Ministry of Health",
  "Royal Hospital",
  "Sultan Qaboos University",
  "Armed Forces Hospital",
];
const DEMO_TITLES = [
  "Supply of specialty medicines, cold-chain consumables and distribution support services across regional facilities",
  "Annual pharmaceutical distribution framework",
  "Laboratory reagents and diagnostic kits",
  "Hospital ward medical supplies",
  "Primary care clinic consumables",
  "Oncology medicines supply agreement",
  "Cardiology equipment and accessories",
  "Emergency medical stock replenishment",
  "Surgical disposables framework contract",
  "Renal care products and support services",
  "Vaccination programme supply",
  "Clinical nutrition products",
  "Medical imaging consumables",
  "Community pharmacy product supply",
  "Intensive care medicines and devices",
  "Dental clinic supplies",
  "Long-term healthcare products supply for regional facilities",
];
const DEMO_VALUES = [
  1_850_000,
  1_420_000,
  980_000,
  760_000,
  640_000,
  540_000,
  425_000,
  360_000,
  290_000,
  235_000,
  190_000,
  155_000,
  125_000,
  98_000,
  78_000,
  52_000,
  36_000,
];
const DEMO_CLOSING_OFFSETS = [-18, -7, -2, 0, 3, 6, 9, 13, 18, 25, 34, 48, 62, 74, 7, 15, 29];

export const getDashboardDemoTenders = (referenceDate = new Date()): DashboardTender[] =>
  DEMO_TITLES.map((title, index) => {
    const createdAt = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - (index % 10),
      3 + (index % 21),
    );
    const closingDate = new Date(referenceDate);
    closingDate.setDate(referenceDate.getDate() + DEMO_CLOSING_OFFSETS[index]);

    return {
      id: index + 101,
      tenderNumber: `TEN-${referenceDate.getFullYear()}-${String(index + 41).padStart(3, "0")}`,
      rfpTitle: title,
      buyerName: DEMO_BUYERS[index % DEMO_BUYERS.length],
      rfpCurrency: DASHBOARD_DEMO_CURRENCY,
      estimatedContractValue: DEMO_VALUES[index],
      status: DEMO_STATUSES[index],
      createdAt: createdAt.toISOString(),
      publishDate: createdAt.toISOString(),
      closingDate: closingDate.toISOString(),
      rfpDocuments: [],
      rfpOwners: [],
      rfpCategories: [],
    };
  });
