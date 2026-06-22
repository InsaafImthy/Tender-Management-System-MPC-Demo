const statusClasses: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  published: "bg-violet-50 text-violet-700 ring-violet-200",
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

const StatusBadge = ({ status }: { status?: string | number | boolean }) => {
  const label = typeof status === "boolean" ? (status ? "Open" : "Closed") : String(status ?? "Unknown");
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClasses[label.toLowerCase()] ?? statusClasses.draft}`}>{label}</span>;
};

export default StatusBadge;
