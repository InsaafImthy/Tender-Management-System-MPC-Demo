import { createBomAsync, getAllBomsAsync } from "../../../services/bomService";
import { getAllCategoriesAsync } from "../../../services/categoryService";
import { IBom, IBomItem } from "../../../types/bomTypes";
import { getUserCredentials } from "../../../utils/common";
import { getBOQExtractionSeed, getPageCount } from "./boqExtractionSeedData";
import { getProvider, principalProviders } from "./principalProviderMaster";
import {
  BOQExtractionResult,
  BOQIntakeSession,
  BOQUploadRecord,
  BOQRfpCreationHandoff,
  DraftRFP,
  ExtractedBOQLine,
} from "./types";

const SESSION_KEY = "muscat_pharmacy_boq_intake_sessions";
const sourceFileRegistry = new Map<string, File>();

const categoryRules = [
  { keywords: ["PHOENIX", "GRAM", "AST", "ID BROTH", "YEAST", "BACTERIAL", "MATRIX", "HAEMOGLOBINOMETER"], category: "Laboratory / Diagnostics", subCategory: "Diagnostic reagents and systems" },
  { keywords: ["SURGICAL", "SCALPEL", "FORCEPS", "SUTURE", "DRESSING", "WELDER"], category: "Surgical Consumables", subCategory: "Procedure and sterile supplies" },
  { keywords: ["BED", "PATIENT CHAIR", "TROLLEY", "WHEELCHAIR", "WALKER"], category: "Mobility / Hospital Furniture", subCategory: "Patient furniture and mobility" },
  { keywords: ["GLOVES", "MASK", "SYRINGE", "NEEDLE"], category: "Medical Consumables", subCategory: "General disposable supplies" },
  { keywords: ["MONITOR", "VENTILATOR", "ECG", "ULTRASOUND", "X-RAY", "IRRADIATOR", "APHERESIS", "TRANSPORT BOX"], category: "Medical Equipment", subCategory: "Clinical equipment and systems" },
];

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

export const categorizeLine = (line: ExtractedBOQLine): ExtractedBOQLine => {
  const text = `${line.itemName} ${line.remarks}`.toUpperCase();
  const rule = categoryRules.find((candidate) => candidate.keywords.some((keyword) => text.includes(keyword)));
  const category = rule?.category ?? "Medical Consumables";
  const subCategory = rule?.subCategory ?? "General healthcare supplies";
  const keywordMatches = rule?.keywords.filter((keyword) => text.includes(keyword)).length ?? 0;
  const confidence = Math.min(99, rule ? 87 + keywordMatches * 3 : 76);

  const matchedProviders = principalProviders
    .filter((provider) => provider.status === "Active")
    .map((provider) => ({
      provider,
      brandMatch: provider.brandsHandled.some((brand) => text.includes(brand.toUpperCase())),
      categoryMatch: provider.categoryCoverage.includes(category),
    }))
    .filter((match) => match.brandMatch || match.categoryMatch)
    .sort((a, b) => Number(b.brandMatch) - Number(a.brandMatch) || Number(b.provider.preferredVendor) - Number(a.provider.preferredVendor));

  const suggestedProviderIds = matchedProviders.map((match) => match.provider.providerId);
  return {
    ...line,
    category,
    subCategory,
    confidence,
    suggestedProviderIds,
    selectedProviderId: line.selectedProviderId || suggestedProviderIds[0] || "PP-005",
  };
};

export const enrichExtraction = (extraction: BOQExtractionResult): BOQExtractionResult => ({
  ...extraction,
  lines: extraction.lines.map(categorizeLine),
});

const getNextDraftSequence = () => {
  const sequenceNumbers = readJson<BOQIntakeSession[]>(SESSION_KEY, [])
    .flatMap((session) => session.drafts)
    .map((draft) => Number(draft.draftNumber.match(/(\d+)$/)?.[1] ?? 0));
  return Math.max(0, ...sequenceNumbers) + 1;
};

export const createDraftGroups = (
  extraction: BOQExtractionResult,
  sourceDocumentName: string,
  existingDrafts: DraftRFP[] = [],
): DraftRFP[] => {
  const groups = new Map<string, ExtractedBOQLine[]>();
  extraction.lines.forEach((line) => {
    if (!line.selectedProviderId) return;
    groups.set(line.selectedProviderId, [...(groups.get(line.selectedProviderId) ?? []), line]);
  });

  const nextDraftSequence = getNextDraftSequence();
  let newDraftOffset = 0;
  return Array.from(groups.entries()).map(([providerId, lines]) => {
    const provider = getProvider(providerId);
    const existing = existingDrafts.find((draft) => draft.providerId === providerId);
    const draftNumber = existing?.draftNumber ?? `RFP-DRAFT-${String(nextDraftSequence + newDraftOffset++).padStart(4, "0")}`;
    const now = new Date().toISOString();
    const category = [...new Set(lines.map((line) => line.category))].join(" / ");
    return {
      id: existing?.id ?? `${providerId}-${draftNumber}`,
      draftNumber,
      title: existing?.title ?? `${category} - ${extraction.issuingDepartment}`,
      providerId,
      providerName: provider?.providerName ?? "Principal provider",
      category,
      boqReferenceNo: extraction.boqReferenceNo,
      demandNo: extraction.demandNo,
      sourceDocumentName,
      closingDate: extraction.closingDate,
      submissionDeadline: existing?.submissionDeadline ?? extraction.closingDate,
      deliveryTerms: existing?.deliveryTerms ?? "Delivery in accordance with the BOQ schedule and Ministry of Health requirements",
      warrantyPeriod: existing?.warrantyPeriod ?? "Minimum 12 months from final acceptance; manufacturer warranty terms apply",
      catalogueRequired: true,
      manufacturerCountryRequired: true,
      commercialTermsRequired: true,
      internalNotes: existing?.internalNotes ?? "",
      status: existing?.status ?? "Draft",
      lines: lines.map((line) => ({ ...line, rfpGroup: draftNumber })),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
  });
};

export const createIntakeSession = (file: File): BOQIntakeSession => {
  const credentials = getUserCredentials();
  const id = `boq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const extraction = enrichExtraction(getBOQExtractionSeed(file.name));
  const upload: BOQUploadRecord = {
    id,
    fileName: file.name,
    fileType: file.type === "application/pdf" ? "PDF document" : "PDF document",
    pages: getPageCount(file.name),
    uploadedBy: credentials.name || "Procurement Team",
    uploadedAt: new Date().toISOString(),
    status: "Review Required",
  };
  sourceFileRegistry.set(id, file);
  const drafts = createDraftGroups(extraction, file.name);
  const groupByLine = new Map(drafts.flatMap((draft) => draft.lines.map((line) => [line.id, draft.draftNumber] as const)));
  const groupedExtraction = {
    ...extraction,
    lines: extraction.lines.map((line) => ({ ...line, rfpGroup: groupByLine.get(line.id) })),
  };
  return { upload, extraction: groupedExtraction, drafts };
};

export const getSessions = (): BOQIntakeSession[] => readJson<BOQIntakeSession[]>(SESSION_KEY, []);

export const getSession = (sessionId: string) => getSessions().find((session) => session.upload.id === sessionId);

export const saveSession = (session: BOQIntakeSession) => {
  const sessions = getSessions();
  const next = sessions.some((item) => item.upload.id === session.upload.id)
    ? sessions.map((item) => item.upload.id === session.upload.id ? session : item)
    : [session, ...sessions];
  writeJson(SESSION_KEY, next);
  return session;
};

export const saveDraft = (draft: DraftRFP) => {
  const sessions = getSessions();
  const next = sessions.map((session) => ({
    ...session,
    drafts: session.drafts.map((item) => item.id === draft.id ? { ...draft, updatedAt: new Date().toISOString() } : item),
  }));
  writeJson(SESSION_KEY, next);
};

export const getDraft = (draftId: string) => getSessions().flatMap((session) => session.drafts).find((draft) => draft.id === draftId);

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const findCategoryId = (categoryNames: string[], categories: Array<{ id: number; name?: string; categoryName?: string }>) => {
  const requested = categoryNames.map(normalize);
  const exact = categories.find((category) => requested.includes(normalize(category.name ?? category.categoryName ?? "")));
  if (exact) return Number(exact.id);

  const scored = categories.map((category) => {
    const categoryTokens = new Set(normalize(category.name ?? category.categoryName ?? "").split(" ").filter(Boolean));
    const score = Math.max(...requested.map((name) => name.split(" ").filter((token) => categoryTokens.has(token)).length));
    return { category, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? Number(scored[0].category.id) : undefined;
};

const toBomUnit = (unit: string) => {
  const normalized = normalize(unit);
  if (normalized.includes("bottle")) return 2;
  if (normalized.includes("vial")) return 3;
  if (normalized.includes("kilogram")) return 4;
  if (normalized.includes("carton")) return 5;
  if (normalized.includes("liter")) return 6;
  return 0;
};

const allBomItems = (boms: IBom[]) => boms.flatMap((bom) => bom.bomItemDtos ?? []);

export const prepareDraftForRfpCreation = async (draft: DraftRFP): Promise<BOQRfpCreationHandoff> => {
  const [categoriesResponse, bomsResponse] = await Promise.all([
    getAllCategoriesAsync({ fields: [], pageNo: 0, pageSize: 0 }),
    getAllBomsAsync({ fields: [], pageNo: 0, pageSize: 0, sortColumn: "CreatedAt", sortDirection: "DESC" }),
  ]);
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const categoryNames = [...new Set(draft.lines.map((line) => line.category))];
  const categoryIdByName = new Map(categoryNames.map((name) => [name, findCategoryId([name], categories)]));
  const unmatchedCategories = categoryNames.filter((name) => !categoryIdByName.get(name));
  if (unmatchedCategories.length > 0) throw new Error(`No active backend category matches ${unmatchedCategories.join(", ")}. Map the BOQ lines to an existing category first.`);
  const categoryIds = [...new Set(categoryNames.map((name) => categoryIdByName.get(name) as number))];

  let boms = bomsResponse.data;
  let products = allBomItems(boms);
  const productByCode = new Map(products.map((item) => [normalize(item.itemCode), item]));
  const missingLines = draft.lines.filter((line) => !productByCode.has(normalize(line.itemCode)));

  if (missingLines.length > 0) {
    const missingByCategory = new Map<number, typeof missingLines>();
    missingLines.forEach((line) => {
      const categoryId = categoryIdByName.get(line.category) as number;
      missingByCategory.set(categoryId, [...(missingByCategory.get(categoryId) ?? []), line]);
    });
    const createdBoms = await Promise.all(Array.from(missingByCategory.entries()).map(([categoryId, lines]) => createBomAsync({
      bomName: `${draft.boqReferenceNo} - ${draft.providerName} - ${lines[0].category}`,
      categoryId,
      description: `Products created from ${draft.sourceDocumentName} for ${draft.draftNumber}`,
      bomItemDtos: lines.map((line) => ({
        itemCode: line.itemCode,
        itemName: line.itemName,
        categoryId,
        quantity: line.quantity,
        unit: toBomUnit(line.unit),
        price: 0,
        description: `BOQ unit: ${line.unit}. ${line.remarks}`,
        supplier: draft.providerName,
      })),
    })));
    const refreshedBoms = await getAllBomsAsync({ fields: [], pageNo: 0, pageSize: 0, sortColumn: "CreatedAt", sortDirection: "DESC" });
    boms = [...createdBoms, ...refreshedBoms.data];
    products = allBomItems(boms);
    products.forEach((item) => productByCode.set(normalize(item.itemCode), item));
  }

  const session = getSessions().find((item) => item.drafts.some((candidate) => candidate.id === draft.id));
  const closingDate = new Date(`${draft.submissionDeadline || draft.closingDate}T17:00:00`);
  const clarificationDate = new Date(closingDate.getTime() - 7 * 86400000);
  const publishDate = new Date();
  const procurementItems = draft.lines.map((line) => {
    const product = productByCode.get(normalize(line.itemCode)) as IBomItem | undefined;
    return { id: product?.id ?? 0, itemName: line.itemName, itemCode: line.itemCode, quantity: line.quantity };
  });

  saveDraft({ ...draft, status: "Ready for Approval", updatedAt: new Date().toISOString() });
  return {
    draftId: draft.id,
    requestData: {
      rfpTitle: draft.title,
      rfpDescription: `BOQ ${draft.boqReferenceNo}\nDemand: ${draft.demandNo}\nPrincipal Provider: ${draft.providerName}\n\nDelivery Terms: ${draft.deliveryTerms}\nWarranty / Guarantee: ${draft.warrantyPeriod}\n\nInternal Notes: ${draft.internalNotes || "None"}`,
      purchaseRequisitionId: draft.demandNo,
      expressInterestLastDate: closingDate.toISOString().slice(0, 19),
      responseDueDate: closingDate.toISOString(),
      clarificationDate: clarificationDate.toISOString(),
      publishDate: publishDate.toISOString(),
      closingDate: closingDate.toISOString().slice(0, 19),
      estimatedContractValue: 0,
      sourceType: "BOQ_UPLOAD",
      sourceDocumentName: draft.sourceDocumentName,
      boqReferenceNo: draft.boqReferenceNo,
      demandNo: draft.demandNo,
      principalProviderId: draft.providerId,
    },
    categoryNames,
    categoryIds,
    procurementItems,
    sourceFile: session ? sourceFileRegistry.get(session.upload.id) : undefined,
    sourceDocumentName: draft.sourceDocumentName,
    productsCreated: missingLines.length,
    productsReused: draft.lines.length - missingLines.length,
  };
};
