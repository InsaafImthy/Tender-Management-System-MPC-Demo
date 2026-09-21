import { RotateCcw } from "lucide-react";
import { DashboardFilterOptions, DashboardFiltersState } from "../../types/dashboardTypes";

interface DashboardFiltersProps {
  filters: DashboardFiltersState;
  options: DashboardFilterOptions;
  onChange: (next: DashboardFiltersState) => void;
  onReset: () => void;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const FilterSelect = ({ label, value, onChange, children }: FilterSelectProps) => (
  <label className="dashboard-filter">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  </label>
);

const DashboardFilters = ({ filters, options, onChange, onReset }: DashboardFiltersProps) => {
  const update = (key: keyof DashboardFiltersState, value: string) => onChange({ ...filters, [key]: value });
  const hasFilters = Object.values(filters).some((value) => value !== "all");

  return (
    <div className="dashboard-filters" aria-label="Dashboard filters">
      <FilterSelect label="Tender year" value={filters.year} onChange={(value) => update("year", value)}>
        <option value="all">All years</option>
        {options.years.map((year) => <option key={year} value={year}>{year}</option>)}
      </FilterSelect>
      <FilterSelect label="Tender status" value={filters.status} onChange={(value) => update("status", value)}>
        <option value="all">All statuses</option>
        {options.statuses.map((status) => (
          <option key={status.value} value={status.value}>{status.label}</option>
        ))}
      </FilterSelect>
      <FilterSelect label="Buyer" value={filters.buyer} onChange={(value) => update("buyer", value)}>
        <option value="all">All buyers</option>
        {options.buyers.map((buyer) => <option key={buyer} value={buyer}>{buyer}</option>)}
      </FilterSelect>
      <FilterSelect label="Currency" value={filters.currency} onChange={(value) => update("currency", value)}>
        <option value="all">All currencies</option>
        {options.currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
      </FilterSelect>
      <button
        type="button"
        className="dashboard-filter-reset"
        onClick={onReset}
        disabled={!hasFilters}
        title="Reset filters"
      >
        <RotateCcw size={15} />
        Reset
      </button>
    </div>
  );
};

export default DashboardFilters;

