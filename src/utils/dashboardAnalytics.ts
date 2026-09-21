import { rfpStatuses } from "./constants";
import {
  DashboardBuyerItem,
  DashboardDistributionItem,
  DashboardFiltersState,
  DashboardMetrics,
  DashboardTender,
  DashboardTrendPoint,
} from "../types/dashboardTypes";

export const DASHBOARD_STATUS_COLORS: Record<number, string> = {
  0: "#8B9AB0",
  1: "#31B7DE",
  2: "#D95D6A",
  3: "#F0A34A",
  4: "#EDB95A",
  5: "#3154D5",
  6: "#17106B",
  7: "#8B9AB0",
  8: "#6478E8",
  9: "#23A7C9",
  10: "#7258D6",
};

const TERMINAL_STATUSES = new Set([2, 6]);
const DAY_IN_MS = 86_400_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const normalizeDashboardRfps = (response: unknown): DashboardTender[] => {
  const rawItems = Array.isArray(response)
    ? response
    : isRecord(response) && Array.isArray(response.items)
      ? response.items
      : isRecord(response) && Array.isArray(response.data)
        ? response.data
        : [];

  return rawItems.filter(isRecord).map((item) => ({
    ...item,
    rfpDocuments: Array.isArray(item.rfpDocuments) ? item.rfpDocuments : [],
    rfpOwners: Array.isArray(item.rfpOwners) ? item.rfpOwners : [],
    rfpCategories: Array.isArray(item.rfpCategories) ? item.rfpCategories : [],
  })) as DashboardTender[];
};

export const getTenderStatusLabel = (status?: number): string =>
  rfpStatuses.find((item) => item.value === status)?.label ?? "Unknown";

export const isActiveTender = (tender: DashboardTender): boolean =>
  typeof tender.status !== "number" || !TERMINAL_STATUSES.has(tender.status);

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getTenderActivityDate = (tender: DashboardTender): Date | null =>
  parseDate(tender.createdAt) ?? parseDate(tender.publishDate) ?? parseDate(tender.closingDate);

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getDaysRemaining = (closingDate?: string, now = new Date()): number | null => {
  const closing = parseDate(closingDate);
  if (!closing) return null;
  return Math.ceil((startOfDay(closing).getTime() - startOfDay(now).getTime()) / DAY_IN_MS);
};

const safeAmount = (value?: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const getAggregateCurrency = (tenders: DashboardTender[]): string | null => {
  const tendersWithValue = tenders.filter((tender) => safeAmount(tender.estimatedContractValue) !== 0);
  if (tendersWithValue.length === 0) return null;
  if (tendersWithValue.some((tender) => !tender.rfpCurrency?.trim())) return null;

  const currencies = new Set(tendersWithValue.map((tender) => tender.rfpCurrency!.trim().toUpperCase()));
  return currencies.size === 1 ? [...currencies][0] : null;
};

const statusColor = (status?: number): string =>
  typeof status === "number" ? DASHBOARD_STATUS_COLORS[status] ?? "#94A3B8" : "#94A3B8";

export const getDashboardFilterOptions = (tenders: DashboardTender[]) => {
  const years = new Set<string>();
  const buyers = new Set<string>();
  const currencies = new Set<string>();
  const statuses = new Map<number, string>();

  tenders.forEach((tender) => {
    const activityDate = getTenderActivityDate(tender);
    if (activityDate) years.add(String(activityDate.getFullYear()));
    if (tender.buyerName?.trim()) buyers.add(tender.buyerName.trim());
    if (tender.rfpCurrency?.trim()) currencies.add(tender.rfpCurrency.trim().toUpperCase());
    if (typeof tender.status === "number") statuses.set(tender.status, getTenderStatusLabel(tender.status));
  });

  return {
    years: [...years].sort((a, b) => Number(b) - Number(a)),
    buyers: [...buyers].sort((a, b) => a.localeCompare(b)),
    currencies: [...currencies].sort(),
    statuses: [...statuses.entries()]
      .sort(([a], [b]) => a - b)
      .map(([value, label]) => ({ label, value: String(value) })),
  };
};

export const filterDashboardTenders = (
  tenders: DashboardTender[],
  filters: DashboardFiltersState,
): DashboardTender[] => tenders.filter((tender) => {
  const activityDate = getTenderActivityDate(tender);
  if (filters.year !== "all" && String(activityDate?.getFullYear()) !== filters.year) return false;
  if (filters.status !== "all" && String(tender.status) !== filters.status) return false;
  if (filters.buyer !== "all" && tender.buyerName !== filters.buyer) return false;
  if (filters.currency !== "all" && tender.rfpCurrency?.toUpperCase() !== filters.currency) return false;
  return true;
});

const buildMonthlyTrend = (tenders: DashboardTender[]): { points: DashboardTrendPoint[]; periodLabel: string } => {
  const datedTenders = tenders
    .map((tender) => ({ tender, date: getTenderActivityDate(tender) }))
    .filter((item): item is { tender: DashboardTender; date: Date } => item.date !== null);

  const latestDate = datedTenders.reduce<Date | null>(
    (latest, item) => (!latest || item.date > latest ? item.date : latest),
    null,
  ) ?? new Date();
  const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(endMonth.getFullYear(), endMonth.getMonth() - (11 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-GB", { month: "short" }),
      tenderCount: 0,
      estimatedValue: 0,
    };
  });

  const byKey = new Map(months.map((month) => [month.key, month]));
  datedTenders.forEach(({ tender, date }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = byKey.get(key);
    if (!month) return;
    month.tenderCount += 1;
    month.estimatedValue += safeAmount(tender.estimatedContractValue);
  });

  const start = new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1);
  const formatMonth = (date: Date) => date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return { points: months, periodLabel: `${formatMonth(start)} – ${formatMonth(endMonth)}` };
};

const buildStatusDistribution = (tenders: DashboardTender[]): DashboardDistributionItem[] => {
  const grouped = new Map<string, { value: number; color: string }>();
  tenders.forEach((tender) => {
    const label = getTenderStatusLabel(tender.status);
    const current = grouped.get(label) ?? { value: 0, color: statusColor(tender.status) };
    current.value += 1;
    grouped.set(label, current);
  });

  return [...grouped.entries()]
    .map(([label, item]) => ({ label, ...item }))
    .sort((a, b) => b.value - a.value);
};

const buildDeadlineDistribution = (tenders: DashboardTender[], now: Date): DashboardDistributionItem[] => {
  const counts = [0, 0, 0, 0, 0, 0];
  tenders.filter(isActiveTender).forEach((tender) => {
    const days = getDaysRemaining(tender.closingDate, now);
    if (days === null) counts[5] += 1;
    else if (days < 0) counts[0] += 1;
    else if (days <= 7) counts[1] += 1;
    else if (days <= 14) counts[2] += 1;
    else if (days <= 30) counts[3] += 1;
    else counts[4] += 1;
  });

  const labels = ["Overdue", "0–7 days", "8–14 days", "15–30 days", "30+ days", "No deadline"];
  const colors = ["#D95D6A", "#EDB95A", "#31B7DE", "#5572E5", "#17106B", "#CBD5E1"];
  return labels.map((label, index) => ({ label, value: counts[index], color: colors[index] }));
};

const buildBuyerDistribution = (
  tenders: DashboardTender[],
  aggregateCurrency: string | null,
): { items: DashboardBuyerItem[]; mode: "value" | "count" } => {
  const useValue = aggregateCurrency !== null;
  const grouped = new Map<string, number>();
  tenders.forEach((tender) => {
    const buyer = tender.buyerName?.trim() || "Unassigned";
    const increment = useValue ? safeAmount(tender.estimatedContractValue) : 1;
    grouped.set(buyer, (grouped.get(buyer) ?? 0) + increment);
  });

  return {
    items: [...grouped.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    mode: useValue ? "value" : "count",
  };
};

export const buildTenderDashboardMetrics = (
  tenders: DashboardTender[],
  now = new Date(),
): DashboardMetrics => {
  const active = tenders.filter(isActiveTender);
  const aggregateCurrency = getAggregateCurrency(tenders);
  const activeAggregateCurrency = getAggregateCurrency(active);
  const trend = buildMonthlyTrend(tenders);
  const buyer = buildBuyerDistribution(tenders, aggregateCurrency);
  const upcomingDeadlines = active
    .map((tender) => ({ tender, daysRemaining: getDaysRemaining(tender.closingDate, now) }))
    .filter((item): item is { tender: DashboardTender; daysRemaining: number } =>
      item.daysRemaining !== null && item.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 4);

  const recentTenders = [...tenders]
    .sort((a, b) => (getTenderActivityDate(b)?.getTime() ?? 0) - (getTenderActivityDate(a)?.getTime() ?? 0))
    .slice(0, 8);

  return {
    totalTenders: tenders.length,
    activeTenders: active.length,
    closedTenders: tenders.filter((tender) => tender.status === 6).length,
    closingSoon: active.filter((tender) => {
      const days = getDaysRemaining(tender.closingDate, now);
      return days !== null && days >= 0 && days <= 7;
    }).length,
    overdueTenders: active.filter((tender) => {
      const days = getDaysRemaining(tender.closingDate, now);
      return days !== null && days < 0;
    }).length,
    pendingApproval: tenders.filter((tender) => tender.status === 4).length,
    underEvaluation: tenders.filter((tender) => tender.status === 9).length,
    underAward: tenders.filter((tender) => tender.status === 10).length,
    activePipelineValue: activeAggregateCurrency
      ? active.reduce((sum, tender) => sum + safeAmount(tender.estimatedContractValue), 0)
      : 0,
    aggregateCurrency,
    activePipelineCurrency: activeAggregateCurrency,
    monthlyTrend: trend.points,
    trendPeriodLabel: trend.periodLabel,
    statusDistribution: buildStatusDistribution(tenders),
    deadlineDistribution: buildDeadlineDistribution(tenders, now),
    buyerDistribution: buyer.items,
    buyerDistributionMode: buyer.mode,
    upcomingDeadlines,
    recentTenders,
  };
};

export const formatDashboardCurrency = (
  value: number,
  currency?: string | null,
  compact = false,
): string => {
  if (!currency) return "—";
  const code = currency.toUpperCase();
  const absolute = Math.abs(value);
  let displayValue = value;
  let suffix = "";
  if (compact && absolute >= 1_000_000) {
    displayValue = value / 1_000_000;
    suffix = "M";
  } else if (compact && absolute >= 1_000) {
    displayValue = value / 1_000;
    suffix = "K";
  }

  const formatted = new Intl.NumberFormat("en-OM", {
    minimumFractionDigits: suffix ? 1 : 0,
    maximumFractionDigits: suffix ? 2 : code === "OMR" ? 3 : 0,
  }).format(displayValue);
  return `${code} ${formatted}${suffix}`;
};

export const formatDashboardDate = (value?: string): string => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};
