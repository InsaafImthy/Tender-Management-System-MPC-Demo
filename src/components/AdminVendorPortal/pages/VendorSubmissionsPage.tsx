import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";
import { formatDate, formatMoney } from "../utils/formatters";

const VendorSubmissionsPage = () => {
  const { state } = useAdminVendorPortalContext();
  return <div><SectionHeader title="Submitted vendor bids" description="Commercial proposals received from the Tender Portal. Values and status come directly from the proposal API." />
    <div className="p-6">{state.proposals.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{["Vendor", "RFP", "Submitted", "Bid validity", "Bid value", "Status"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{state.proposals.map((proposal) => <tr key={proposal.id} className="hover:bg-violet-50/30"><td className="px-4 py-3"><p className="text-sm font-bold text-slate-900">{proposal.vendorName ?? `Vendor #${proposal.vendorId ?? "-"}`}</p><p className="text-xs text-slate-500">{proposal.vendorCode}</p></td><td className="px-4 py-3 text-sm text-slate-600">{proposal.rfpTitle ?? proposal.tenderNumber ?? `RFP #${proposal.rfpId ?? "-"}`}</td><td className="px-4 py-3 text-sm text-slate-500">{formatDate(proposal.submittedOn ?? proposal.createdAt)}</td><td className="px-4 py-3 text-sm text-slate-600">{proposal.bidValidity ? `${proposal.bidValidity} days` : "—"}</td><td className="px-4 py-3 text-sm font-bold text-slate-900">{formatMoney(Number(proposal.bidAmount ?? 0))}</td><td className="px-4 py-3"><StatusBadge status={proposal.status ?? "Pending"} /></td></tr>)}</tbody></table></div></div> : <EmptyState title="No proposals submitted" description="Completed proposal submissions from vendors will appear here." />}</div>
  </div>;
};

export default VendorSubmissionsPage;
