import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";
import { formatDate, formatMoney } from "../utils/formatters";

const AdminBidReviewPage = () => {
  const { state, reviewProposal } = useAdminVendorPortalContext();
  return <div><SectionHeader title="Bid review" description="Approve, reject, or return vendor proposals to pending using the same status endpoint as the existing admin RFP detail flow." />
    <div className="space-y-4 p-6">{state.proposals.length ? state.proposals.map((proposal) => {
      const rfp = state.rfps.find((item) => item.id === proposal.rfpId);
      return <section key={proposal.id} className="app-surface p-5">
        <div className="flex flex-col gap-5 desktop:flex-row desktop:items-start desktop:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-bold text-slate-900">{proposal.vendorName ?? `Vendor #${proposal.vendorId ?? "-"}`}</h3><StatusBadge status={proposal.status ?? "Pending"} /></div><p className="mt-2 text-sm text-slate-600">{proposal.rfpTitle ?? rfp?.rfpTitle ?? proposal.tenderNumber ?? `RFP #${proposal.rfpId ?? "-"}`}</p><p className="mt-1 text-xs text-slate-500">Submitted {formatDate(proposal.submittedOn ?? proposal.createdAt)} · {proposal.bidValidity ? `${proposal.bidValidity} day validity` : "Validity not provided"}</p></div>
          <div className="rounded-2xl bg-violet-50 px-5 py-4 text-right ring-1 ring-violet-100"><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Vendor bid</p><p className="mt-1 text-2xl font-bold text-violet-950">{formatMoney(Number(proposal.bidAmount ?? 0), rfp?.rfpCurrency)}</p></div>
        </div>
        {proposal.vendorRfpProposalItems?.length ? <div className="mt-5 overflow-hidden rounded-xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left text-xs font-bold uppercase text-slate-500">Line</th><th className="px-4 py-2 text-right text-xs font-bold uppercase text-slate-500">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{proposal.vendorRfpProposalItems.map((item, index) => <tr key={item.id ?? `${proposal.id}-${index}`}><td className="px-4 py-2 text-sm text-slate-700">{rfp?.rfpItems?.find((rfpItem) => rfpItem.id === item.rfpItemId)?.itemName ?? `Item #${item.rfpItemId ?? index + 1}`}</td><td className="px-4 py-2 text-right text-sm font-bold text-slate-900">{formatMoney(Number(item.amount ?? 0), rfp?.rfpCurrency)}</td></tr>)}</tbody></table></div> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" disabled={state.saving} onClick={() => void reviewProposal(proposal.id, "Pending")} className="app-button-secondary disabled:opacity-50">Mark pending</button><button type="button" disabled={state.saving} onClick={() => void reviewProposal(proposal.id, "Rejected")} className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Reject</button><button type="button" disabled={state.saving} onClick={() => void reviewProposal(proposal.id, "Approved")} className="app-button-primary disabled:opacity-50">Approve</button></div>
      </section>;
    }) : <EmptyState title="No bids to review" description="Submitted vendor proposals will appear here with their backend review status." />}</div>
  </div>;
};

export default AdminBidReviewPage;
