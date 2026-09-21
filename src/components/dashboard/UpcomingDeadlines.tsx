import { ArrowUpRight, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardDeadlineItem } from "../../types/dashboardTypes";
import { formatDashboardDate } from "../../utils/dashboardAnalytics";

const deadlineLabel = (days: number) => {
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

const UpcomingDeadlines = ({ items }: { items: DashboardDeadlineItem[] }) => {
  const navigate = useNavigate();

  return (
    <section className="dashboard-panel dashboard-panel--compact">
      <div className="dashboard-panel__header">
        <div>
          <h2>Upcoming deadlines</h2>
          <p>Nearest active tender closing dates</p>
        </div>
        <CalendarClock size={18} className="dashboard-panel__header-icon" aria-hidden="true" />
      </div>
      {items.length > 0 ? (
        <div className="dashboard-deadlines">
          {items.map(({ tender, daysRemaining }) => (
            <button
              key={tender.id ?? tender.tenderNumber ?? tender.rfpTitle}
              type="button"
              className="dashboard-deadline"
              onClick={() => tender.id && navigate(`/rfps/${tender.id}`)}
              disabled={!tender.id}
            >
              <span className="dashboard-deadline__date">
                <strong>{new Date(tender.closingDate!).toLocaleDateString("en-GB", { day: "2-digit" })}</strong>
                <small>{new Date(tender.closingDate!).toLocaleDateString("en-GB", { month: "short" })}</small>
              </span>
              <span className="dashboard-deadline__content">
                <strong>{tender.rfpTitle || "Untitled tender"}</strong>
                <small>{tender.tenderNumber || `RFP #${tender.id ?? "—"}`} · {formatDashboardDate(tender.closingDate)}</small>
              </span>
              <span className={`dashboard-deadline__badge ${daysRemaining <= 7 ? "dashboard-deadline__badge--urgent" : ""}`}>
                {deadlineLabel(daysRemaining)}
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty">No upcoming deadlines match the selected filters.</div>
      )}
    </section>
  );
};

export default UpcomingDeadlines;

