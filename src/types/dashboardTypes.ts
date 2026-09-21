import { IRfp } from "./rfpTypes";

export interface DashboardTender extends Omit<IRfp, "id"> {
  id?: number;
  tenderNumber?: string;
  createdAt?: string;
  publishDate?: string;
  departmentName?: string;
  categoryName?: string;
  categories?: Array<{ id?: number; name?: string; value?: string }>;
  rfpCategories: Array<{
    categoryId?: number;
    categoryName?: string;
    category?: { id?: number; name?: string };
  }>;
}

export interface DashboardFiltersState {
  year: string;
  status: string;
  buyer: string;
  currency: string;
}

export interface DashboardFilterOptions {
  years: string[];
  statuses: Array<{ label: string; value: string }>;
  buyers: string[];
  currencies: string[];
}

export interface DashboardTrendPoint {
  key: string;
  label: string;
  tenderCount: number;
  estimatedValue: number;
}

export interface DashboardDistributionItem {
  label: string;
  value: number;
  color: string;
}

export interface DashboardBuyerItem {
  label: string;
  value: number;
}

export interface DashboardDeadlineItem {
  tender: DashboardTender;
  daysRemaining: number;
}

export interface DashboardMetrics {
  totalTenders: number;
  activeTenders: number;
  closedTenders: number;
  closingSoon: number;
  overdueTenders: number;
  pendingApproval: number;
  underEvaluation: number;
  underAward: number;
  activePipelineValue: number;
  aggregateCurrency: string | null;
  activePipelineCurrency: string | null;
  monthlyTrend: DashboardTrendPoint[];
  trendPeriodLabel: string;
  statusDistribution: DashboardDistributionItem[];
  deadlineDistribution: DashboardDistributionItem[];
  buyerDistribution: DashboardBuyerItem[];
  buyerDistributionMode: "value" | "count";
  upcomingDeadlines: DashboardDeadlineItem[];
  recentTenders: DashboardTender[];
}
