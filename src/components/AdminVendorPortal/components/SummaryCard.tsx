import { ReactNode } from "react";

type SummaryCardProps = { label: string; value: string | number; helper?: string; icon?: ReactNode };

const SummaryCard = ({ label, value, helper, icon }: SummaryCardProps) => (
  <div className="app-surface p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
      </div>
      {icon && <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">{icon}</span>}
    </div>
  </div>
);

export default SummaryCard;
