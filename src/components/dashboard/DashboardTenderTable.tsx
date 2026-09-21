import { ArrowRight, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardTender } from "../../types/dashboardTypes";
import {
  DASHBOARD_STATUS_COLORS,
  formatDashboardCurrency,
  formatDashboardDate,
  getDaysRemaining,
  getTenderStatusLabel,
} from "../../utils/dashboardAnalytics";

const remainingLabel = (closingDate?: string) => {
  const days = getDaysRemaining(closingDate);
  if (days === null) return "No deadline";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  return `${days} days`;
};

const DashboardTenderTable = ({ tenders }: { tenders: DashboardTender[] }) => {
  const navigate = useNavigate();

  return (
    <section className="dashboard-panel dashboard-table-panel">
      <div className="dashboard-panel__header dashboard-table-header">
        <div>
          <h2>Recent tender portfolio</h2>
          <p>Latest tenders from the current filter selection</p>
        </div>
        <button type="button" className="dashboard-text-action" onClick={() => navigate("/rfps")}>
          View all tenders <ArrowRight size={15} />
        </button>
      </div>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <colgroup>
            <col className="dashboard-table__col-number" />
            <col className="dashboard-table__col-title" />
            <col className="dashboard-table__col-buyer" />
            <col className="dashboard-table__col-value" />
            <col className="dashboard-table__col-date" />
            <col className="dashboard-table__col-status" />
            <col className="dashboard-table__col-days" />
          </colgroup>
          <thead>
            <tr>
              <th>Tender no.</th>
              <th>Title</th>
              <th>Buyer</th>
              <th className="dashboard-table__align-right">Estimated value</th>
              <th>Closing date</th>
              <th>Status</th>
              <th className="dashboard-table__align-right">Days remaining</th>
            </tr>
          </thead>
          <tbody>
            {tenders.length > 0 ? tenders.map((tender) => {
              const statusColor = typeof tender.status === "number" ? DASHBOARD_STATUS_COLORS[tender.status] : "#94A3B8";
              const remaining = remainingLabel(tender.closingDate);
              return (
                <tr
                  key={tender.id ?? tender.tenderNumber ?? tender.rfpTitle}
                  tabIndex={tender.id ? 0 : -1}
                  onClick={() => tender.id && navigate(`/rfps/${tender.id}`)}
                  onKeyDown={(event) => {
                    if (tender.id && (event.key === "Enter" || event.key === " ")) navigate(`/rfps/${tender.id}`);
                  }}
                  className={tender.id ? "dashboard-table__row--clickable" : ""}
                >
                  <td><strong>{tender.tenderNumber || `RFP #${tender.id ?? "—"}`}</strong></td>
                  <td><span className="dashboard-table__title" title={tender.rfpTitle}>{tender.rfpTitle || "Untitled tender"}</span></td>
                  <td>{tender.buyerName || "Unassigned"}</td>
                  <td className="dashboard-table__money dashboard-table__align-right">{formatDashboardCurrency(tender.estimatedContractValue ?? 0, tender.rfpCurrency)}</td>
                  <td><span className="dashboard-table__date"><CalendarDays size={14} />{formatDashboardDate(tender.closingDate)}</span></td>
                  <td>
                    <span className="dashboard-status-badge" style={{ color: statusColor, backgroundColor: `${statusColor}12`, borderColor: `${statusColor}35` }}>
                      <i style={{ backgroundColor: statusColor }} />
                      {getTenderStatusLabel(tender.status)}
                    </span>
                  </td>
                  <td className="dashboard-table__align-right"><span className={remaining.includes("overdue") ? "dashboard-days dashboard-days--overdue" : "dashboard-days"}>{remaining}</span></td>
                </tr>
              );
            }) : (
              <tr><td colSpan={7}><div className="dashboard-empty dashboard-empty--table">No tenders match the selected filters.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DashboardTenderTable;
