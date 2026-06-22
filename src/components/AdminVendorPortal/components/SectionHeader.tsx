import { ReactNode } from "react";

type SectionHeaderProps = { title: string; description: string; actions?: ReactNode };

const SectionHeader = ({ title, description, actions }: SectionHeaderProps) => (
  <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-white px-6 py-5 desktop:flex-row desktop:items-center desktop:justify-between">
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default SectionHeader;
