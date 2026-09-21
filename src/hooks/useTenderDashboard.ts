import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardDemoTenders } from "../data/dashboardDemoData";
import { DashboardFiltersState, DashboardTender } from "../types/dashboardTypes";
import {
  buildTenderDashboardMetrics,
  filterDashboardTenders,
  getDashboardFilterOptions,
} from "../utils/dashboardAnalytics";

export const INITIAL_DASHBOARD_FILTERS: DashboardFiltersState = {
  year: "all",
  status: "all",
  buyer: "all",
  currency: "all",
};

export const useTenderDashboard = (filters: DashboardFiltersState) => {
  const [tenders, setTenders] = useState<DashboardTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTenders(getDashboardDemoTenders());
    setLastUpdated(new Date());
    setLoading(false);
  }, [refreshKey]);

  const filterOptions = useMemo(() => getDashboardFilterOptions(tenders), [tenders]);
  const filteredTenders = useMemo(() => filterDashboardTenders(tenders, filters), [tenders, filters]);
  const metrics = useMemo(() => buildTenderDashboardMetrics(filteredTenders), [filteredTenders]);

  return { tenders, filteredTenders, filterOptions, metrics, loading, error, lastUpdated, refresh };
};
