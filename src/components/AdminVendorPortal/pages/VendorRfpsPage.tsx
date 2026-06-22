import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";
import { formatDate, formatMoney } from "../utils/formatters";

const VendorRfpsPage = () => {
  const { state, publishRfp } = useAdminVendorPortalContext();
  return <div>
    <SectionHeader title="Vendor RFPs" description="The live RFP catalogue exposed to vendors. Drafts can be published here; detailed changes stay in the established RFP workflow." actions={<Link to="/rfps/create-rfp" className="app-button-primary">Create RFP</Link>} />
    <div className="p-6">
      {state.rfps.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-auto"><table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50"><tr>{["RFP", "Category", "Closing date", "Bid value", "Status", "Action"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{state.rfps.map((rfp) => {
          const status = rfp.isPublished ? (rfp.isOpen === false ? "Closed" : "Published") : "Draft";
          return <tr key={rfp.id} className="hover:bg-violet-50/30"><td className="px-4 py-3"><Link to={`/rfps/${rfp.id}`} className="text-sm font-bold text-violet-700 hover:text-violet-900">{rfp.tenderNumber ?? `RFP #${rfp.id}`}</Link><p className="mt-1 text-xs text-slate-500">{rfp.rfpTitle}</p></td><td className="px-4 py-3 text-sm text-slate-600">{rfp.categoryName ?? state.categories.find((category) => category.id === rfp.categoryId)?.name ?? "Multiple"}</td><td className="px-4 py-3 text-sm text-slate-600">{formatDate(rfp.closingDate)}</td><td className="px-4 py-3 text-sm font-bold text-slate-900">{formatMoney(Number((rfp as { bidValue?: number }).bidValue ?? 0), rfp.rfpCurrency)}</td><td className="px-4 py-3"><StatusBadge status={status} /></td><td className="px-4 py-3">{rfp.isPublished ? <Link to={`/rfps/${rfp.id}`} className="text-sm font-bold text-violet-700">Open</Link> : <button type="button" onClick={() => void publishRfp(rfp.id)} disabled={state.saving} className="app-button-primary disabled:opacity-50">Publish</button>}</td></tr>;
        })}</tbody>
      </table></div></div> : <EmptyState title="No RFPs available" description="Create an RFP from a product list. It will appear here and in the Tender Portal after publication." />}
    </div>
  </div>;
};

export default VendorRfpsPage;
