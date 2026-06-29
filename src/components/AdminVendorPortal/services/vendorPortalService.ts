import * as XLSX from "xlsx";
import axios from "axios";
import { Urls } from "../../../services/ApiConfig";
import { getUserToken } from "../../../utils/common";
import { IBom } from "../../../types/bomTypes";
import {
  BoqImportItem,
  CategoryOption,
  PortalInterest,
  PortalProposal,
  PortalRfp,
  PortalVendor,
} from "../types/vendorPortalTypes";

const allRecordsFilter = { fields: [], pageNo: 0, pageSize: 0, sortColumn: "CreatedAt", sortDirection: "DESC" };

const api = axios.create({ baseURL: `${Urls.defaultUrl}/api` });
api.interceptors.request.use((config) => {
  const token = getUserToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const asArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
  }
  return [];
};

const errorMessage = (reason: unknown) => reason instanceof Error ? reason.message : "The server request failed.";

export const loadVendorPortalData = async () => {
  const requests = [
    api.post("/Category/GetCategories", allRecordsFilter),
    api.post("/Boms/filter", allRecordsFilter),
    api.post("/Rfps/filter", allRecordsFilter),
    api.post("/Rfps/GetAllRfpIntrestsAsync", allRecordsFilter),
    api.post("/Rfps/GetAllRfpProposalsAsync", allRecordsFilter),
    api.post("/Vendor/filter", allRecordsFilter),
  ];
  const results = await Promise.allSettled(requests);
  const failure = results.find((result) => result.status === "rejected");
  const value = (index: number): unknown => results[index].status === "fulfilled" ? results[index].value.data : [];

  return {
    categories: asArray<Record<string, unknown>>(value(0)).map((item) => ({
      id: Number(item.id),
      name: String(item.name ?? item.categoryName ?? "Unlabelled category"),
    })).filter((item) => Number.isFinite(item.id)),
    boms: asArray<IBom>(value(1)),
    rfps: asArray<PortalRfp>(value(2)),
    interests: asArray<PortalInterest>(value(3)),
    proposals: asArray<PortalProposal>(value(4)),
    vendors: asArray<PortalVendor>(value(5)),
    error: failure?.status === "rejected" ? errorMessage(failure.reason) : undefined,
  };
};

const findValue = (row: Record<string, unknown>, aliases: string[]) => {
  const key = Object.keys(row).find((candidate) => aliases.includes(candidate.trim().toLowerCase().replace(/[\s_-]+/g, "")));
  return key ? row[key] : undefined;
};

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseBoqFile = async (file: File, categories: CategoryOption[]): Promise<BoqImportItem[]> => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["xlsx", "xls", "csv"].includes(extension)) {
    throw new Error("Upload an Excel or CSV file (.xlsx, .xls, or .csv). PDF files cannot be converted reliably.");
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
  if (!rows.length) throw new Error("The selected file does not contain any BOQ rows.");

  const categoryByName = new Map(categories.map((category) => [category.name.toLowerCase(), category.id]));
  const items = rows.map((row, index) => {
    const itemName = String(findValue(row, ["item", "itemname", "description", "product", "productname"]) ?? "").trim();
    const categoryName = String(findValue(row, ["category", "categoryname"]) ?? "").trim().toLowerCase();
    return {
      id: `import-${index + 1}`,
      lineNo: index + 1,
      itemCode: String(findValue(row, ["itemcode", "code", "sku"]) ?? `ITEM-${String(index + 1).padStart(4, "0")}`).trim(),
      itemName,
      categoryId: categoryByName.get(categoryName),
      quantity: numberValue(findValue(row, ["quantity", "qty"]), 1),
      unit: numberValue(findValue(row, ["unit", "unitid", "uom"])),
      price: numberValue(findValue(row, ["price", "unitprice", "rate", "targetrate"])),
      description: String(findValue(row, ["description", "remarks", "notes"]) ?? "").trim(),
    };
  }).filter((item) => item.itemName);

  if (!items.length) throw new Error("No item names were found. Include an Item, Item Name, Description, or Product column.");
  return items;
};

export const createImportedBoms = async (items: BoqImportItem[], categories: CategoryOption[], sourceName: string) => {
  const uncategorized = items.filter((item) => !item.categoryId);
  if (uncategorized.length) throw new Error(`Assign a category to all ${uncategorized.length} uncategorized item(s) before saving.`);

  const groups = new Map<number, BoqImportItem[]>();
  items.forEach((item) => groups.set(item.categoryId!, [...(groups.get(item.categoryId!) ?? []), item]));

  await Promise.all(Array.from(groups.entries()).map(([categoryId, categoryItems]) => {
    const category = categories.find((item) => item.id === categoryId);
    const payload = {
      id: 0,
      bomName: `${sourceName.replace(/\.[^.]+$/, "")} - ${category?.name ?? "BOQ"}`,
      categoryId,
      description: `Imported from ${sourceName}`,
      bomItemDtos: categoryItems.map(({ itemCode, itemName, quantity, unit, price, description }) => ({
        itemCode,
        itemName,
        categoryId,
        quantity,
        unit,
        price,
        description,
      })),
    };
    return api.post("/Boms", payload);
  }));
};

export const publishPortalRfp = (rfpId: number) => api.post(`/Rfps/RfpPublish?rfpId=${encodeURIComponent(rfpId)}`);
export const reviewPortalProposal = (proposalId: number, status: "Pending" | "Approved" | "Rejected") =>
  api.put(`/Rfps/UpdateProposalStatus?proposalId=${encodeURIComponent(proposalId)}&status=${encodeURIComponent(status)}`);
