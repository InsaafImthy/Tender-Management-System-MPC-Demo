import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  Files,
  Gavel,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import DashboardFilters from "../../components/dashboard/DashboardFilters";
import DashboardKpiCard from "../../components/dashboard/DashboardKpiCard";
import DashboardTenderTable from "../../components/dashboard/DashboardTenderTable";
import TenderStatusChart from "../../components/dashboard/TenderStatusChart";
import TenderTrendChart from "../../components/dashboard/TenderTrendChart";
import TenderValueByBuyerChart from "../../components/dashboard/TenderValueByBuyerChart";
import UpcomingDeadlines from "../../components/dashboard/UpcomingDeadlines";
import { INITIAL_DASHBOARD_FILTERS, useTenderDashboard } from "../../hooks/useTenderDashboard";
import { DashboardFiltersState } from "../../types/dashboardTypes";
import { formatDashboardCurrency } from "../../utils/dashboardAnalytics";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFiltersState>(INITIAL_DASHBOARD_FILTERS);
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const { filteredTenders, filterOptions, metrics, loading, error, lastUpdated, refresh } = useTenderDashboard(filters);
  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;
  const emptyPipelineCurrency = filters.currency !== "all"
    ? filters.currency
    : filterOptions.currencies.length === 1 ? filterOptions.currencies[0] : null;

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-shell dashboard-loading" aria-label="Loading tender dashboard">
          <div className="dashboard-skeleton dashboard-skeleton--header" />
          <div className="dashboard-skeleton-grid">
            {Array.from({ length: 5 }, (_, index) => <div className="dashboard-skeleton dashboard-skeleton--kpi" key={index} />)}
          </div>
          <div className="dashboard-skeleton-grid dashboard-skeleton-grid--charts">
            <div className="dashboard-skeleton dashboard-skeleton--chart" />
            <div className="dashboard-skeleton dashboard-skeleton--chart" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-shell">
          <section className="dashboard-error" role="alert">
            <TriangleAlert size={24} />
            <div>
              <h1>Dashboard data could not be loaded</h1>
              <p>{error}</p>
            </div>
            <button type="button" onClick={refresh}><RefreshCw size={16} /> Try again</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-header__top">
            <div>
              <h1>Tender Management Overview</h1>
              <p>Portfolio performance, deadlines and tender activity</p>
            </div>
            <div className="dashboard-header__actions">
              <span className="dashboard-updated">
                Updated {lastUpdated?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) ?? "—"}
              </span>
              <button type="button" className="dashboard-icon-button" onClick={refresh} title="Refresh dashboard" aria-label="Refresh dashboard">
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                className={`dashboard-button dashboard-button--filter${activeFilterCount > 0 ? " dashboard-button--filter-active" : ""}`}
                onClick={() => setAreFiltersVisible((visible) => !visible)}
                aria-expanded={areFiltersVisible}
                aria-controls="dashboard-filter-panel"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && <span className="dashboard-filter-count" aria-label={`${activeFilterCount} active filters`}>{activeFilterCount}</span>}
              </button>
              <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => navigate("/rfps")}>
                View all tenders
              </button>
              <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => navigate("/rfps/create-rfp")}>
                <Plus size={16} /> Create tender
              </button>
            </div>
          </div>
          <div
            className={`dashboard-filter-panel${areFiltersVisible ? " dashboard-filter-panel--open" : ""}`}
            id="dashboard-filter-panel"
            aria-hidden={!areFiltersVisible}
            inert={!areFiltersVisible}
          >
            <div className="dashboard-header__filters">
              <DashboardFilters
                filters={filters}
                options={filterOptions}
                onChange={setFilters}
                onReset={() => setFilters(INITIAL_DASHBOARD_FILTERS)}
              />
              <span className="dashboard-result-count">{filteredTenders.length} tenders in view</span>
            </div>
          </div>
        </header>

        <section className="dashboard-kpi-grid" aria-label="Executive tender metrics">
          <DashboardKpiCard
            featured
            label="Active pipeline value"
            value={metrics.activePipelineCurrency
              ? formatDashboardCurrency(metrics.activePipelineValue, metrics.activePipelineCurrency, true)
              : metrics.activeTenders > 0 ? "Mixed" : emptyPipelineCurrency ? formatDashboardCurrency(0, emptyPipelineCurrency) : "—"}
            detail={metrics.activePipelineCurrency ? `${metrics.activeTenders} non-terminal tenders` : metrics.activeTenders > 0 ? "Select one currency to total safely" : "No active tenders in view"}
            icon={BriefcaseBusiness}
          />
          <DashboardKpiCard label="Active tenders" value={String(metrics.activeTenders)} detail="Excludes Closed and Rejected" icon={Files} />
          <DashboardKpiCard label="Closing in 7 days" value={String(metrics.closingSoon)} detail="Includes tenders closing today" icon={CalendarClock} tone="warning" />
          <DashboardKpiCard label="Under evaluation" value={String(metrics.underEvaluation)} detail="Awaiting evaluation outcome" icon={ClipboardCheck} />
          <DashboardKpiCard label="Under award" value={String(metrics.underAward)} detail="In the award workflow" icon={Gavel} tone="positive" />
        </section>

        <section className="dashboard-primary-grid">
          <TenderTrendChart points={metrics.monthlyTrend} currency={metrics.aggregateCurrency} periodLabel={metrics.trendPeriodLabel} />
          <TenderStatusChart data={metrics.statusDistribution} total={metrics.totalTenders} />
        </section>

        <section className="dashboard-secondary-grid">
          <TenderValueByBuyerChart data={metrics.buyerDistribution} mode={metrics.buyerDistributionMode} currency={metrics.aggregateCurrency} />
          <UpcomingDeadlines items={metrics.upcomingDeadlines} />
        </section>

        <section className="dashboard-attention" aria-labelledby="attention-heading">
          <span className="dashboard-attention__icon"><TriangleAlert size={16} /></span>
          <h2 id="attention-heading">Needs attention</h2>
          <div className="dashboard-attention__items">
            <span className="dashboard-attention-item dashboard-attention-item--critical"><strong>{metrics.overdueTenders}</strong> overdue closings</span>
            <span className="dashboard-attention__separator" aria-hidden="true">•</span>
            <span className="dashboard-attention-item dashboard-attention-item--info"><strong>{metrics.underEvaluation}</strong> evaluations pending</span>
            <span className="dashboard-attention__separator" aria-hidden="true">•</span>
            <span className="dashboard-attention-item dashboard-attention-item--warning"><strong>{metrics.pendingApproval}</strong> pending approval</span>
          </div>
        </section>

        <DashboardTenderTable tenders={metrics.recentTenders} />
      </div>
    </main>
  );
};

export default Dashboard;
