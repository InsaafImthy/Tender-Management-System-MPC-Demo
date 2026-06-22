import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";
import { formatDate } from "../utils/formatters";

const VendorInvitationsPage = () => {
  const { state } = useAdminVendorPortalContext();
  return <div><SectionHeader title="Vendor interest" description="Expressions of interest submitted by authenticated vendors through the Tender Portal." />
    <div className="p-6">{state.interests.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{["Vendor", "RFP", "Received", "Status"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{state.interests.map((interest) => <tr key={interest.id} className="hover:bg-violet-50/30"><td className="px-4 py-3"><p className="text-sm font-bold text-slate-900">{interest.vendorName ?? `Vendor #${interest.vendorId ?? "-"}`}</p></td><td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{interest.rfpTitle ?? interest.tenderNumber ?? `RFP #${interest.rfpId ?? "-"}`}</p></td><td className="px-4 py-3 text-sm text-slate-500">{formatDate(interest.createdAt)}</td><td className="px-4 py-3"><StatusBadge status={interest.status ?? "Pending"} /></td></tr>)}</tbody></table></div> : <EmptyState title="No vendor interest received" description="When vendors express interest in published RFPs, those records will appear here." />}</div>
  </div>;
};

export default VendorInvitationsPage;
