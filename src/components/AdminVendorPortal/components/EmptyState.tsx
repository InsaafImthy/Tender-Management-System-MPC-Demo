import { Inbox } from "lucide-react";

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm"><Inbox className="h-5 w-5" /></span>
    <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
  </div>
);

export default EmptyState;
