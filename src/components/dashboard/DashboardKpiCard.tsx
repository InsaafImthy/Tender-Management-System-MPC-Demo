import { LucideIcon } from "lucide-react";

interface DashboardKpiCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  featured?: boolean;
  tone?: "default" | "warning" | "positive";
}

const DashboardKpiCard = ({
  label,
  value,
  detail,
  icon: Icon,
  featured = false,
  tone = "default",
}: DashboardKpiCardProps) => (
  <article className={`dashboard-kpi ${featured ? "dashboard-kpi--featured" : ""}`}>
    <div className="dashboard-kpi__topline">
      <p>{label}</p>
      <span className={`dashboard-kpi__icon dashboard-kpi__icon--${tone}`} aria-hidden="true">
        <Icon size={17} strokeWidth={1.9} />
      </span>
    </div>
    <strong className="dashboard-kpi__value">{value}</strong>
    <p className="dashboard-kpi__detail">{detail}</p>
  </article>
);

export default DashboardKpiCard;

