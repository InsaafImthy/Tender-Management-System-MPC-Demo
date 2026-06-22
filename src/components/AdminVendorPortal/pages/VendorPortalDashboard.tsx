import { Boxes, FileCheck2, FileText, Send, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import SummaryCard from "../components/SummaryCard";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";
import { formatDate, formatMoney } from "../utils/formatters";

const rfpStatus = (rfp: { isPublished?: boolean; isOpen?: boolean; status?: string | number }) =>
  rfp.isPublished ? (rfp.isOpen === false ? "Closed" : "Published") : rfp.status === 5 ? "Draft" : String(rfp.status ?? "Draft");

const VendorPortalDashboard = () => {
  const { state } = useAdminVendorPortalContext();
  const published = state.rfps.filter((rfp) => rfp.isPublished);
  const pending = state.proposals.filter((proposal) => String(proposal.status ?? "Pending").toLowerCase() === "pending");

  return (
    <div>
      <div className="border-b border-slate-200/80 px-6 py-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Vendor operations overview</h2>
        <p className="mt-1 text-sm text-slate-500">Live totals from the same backend used by the Tender Portal.</p>
      </div>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          <SummaryCard label="Product lists" value={state.boms.length} helper="Backend BOM records" icon={<Boxes className="h-5 w-5" />} />
          <SummaryCard label="Published RFPs" value={published.length} helper={`${state.rfps.length} total RFPs`} icon={<FileText className="h-5 w-5" />} />
          <SummaryCard label="Vendor interests" value={state.interests.length} helper="Submitted via Tender Portal" icon={<Send className="h-5 w-5" />} />
          <SummaryCard label="Proposals" value={state.proposals.length} helper={`${pending.length} awaiting review`} icon={<FileCheck2 className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
          <section className="app-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div><h3 className="font-bold text-slate-900">Recent vendor RFPs</h3><p className="mt-1 text-xs text-slate-500">Publication state and closing dates</p></div>
              <Link className="app-button-secondary" to="/vendor-portal/rfps">View all</Link>
            </div>
            {state.rfps.length ? <div className="divide-y divide-slate-100">
              {state.rfps.slice(0, 5).map((rfp) => <Link to={`/rfps/${rfp.id}`} key={rfp.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-violet-50/50">
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{rfp.rfpTitle ?? rfp.tenderNumber ?? `RFP #${rfp.id}`}</p><p className="mt-1 text-xs text-slate-500">Closes {formatDate(rfp.closingDate)}</p></div>
                <StatusBadge status={rfpStatus(rfp)} />
              </Link>)}
            </div> : <div className="p-5"><EmptyState title="No RFPs found" description="Create an RFP from an imported product list to start the vendor workflow." /></div>}
          </section>

          <section className="app-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div><h3 className="font-bold text-slate-900">Latest proposals</h3><p className="mt-1 text-xs text-slate-500">Vendor responses requiring admin attention</p></div>
              <Link className="app-button-secondary" to="/vendor-portal/bid-review">Review</Link>
            </div>
            {state.proposals.length ? <div className="divide-y divide-slate-100">
              {state.proposals.slice(0, 5).map((proposal) => <div key={proposal.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{proposal.vendorName ?? `Vendor #${proposal.vendorId ?? "-"}`}</p><p className="mt-1 text-xs text-slate-500">{proposal.rfpTitle ?? proposal.tenderNumber ?? `RFP #${proposal.rfpId ?? "-"}`}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-slate-900">{formatMoney(Number(proposal.bidAmount ?? 0))}</p><StatusBadge status={proposal.status ?? "Pending"} /></div>
              </div>)}
            </div> : <div className="p-5"><EmptyState title="No proposals received" description="Vendor proposals submitted in the Tender Portal will appear here automatically." /></div>}
          </section>
        </div>

        <div className="app-surface flex flex-col gap-4 p-5 tablet:flex-row tablet:items-center tablet:justify-between">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><UsersRound className="h-5 w-5" /></span><div><p className="font-bold text-slate-900">{state.vendors.length} registered vendors</p><p className="text-sm text-slate-500">Review supplier profiles and registration status.</p></div></div>
          <Link to="/vendor-portal/vendors" className="app-button-primary">Open vendor directory</Link>
        </div>
      </div>
    </div>
  );
};

export default VendorPortalDashboard;
