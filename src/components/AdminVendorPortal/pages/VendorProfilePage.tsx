import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";

const statusLabel = (status?: number | string, active?: boolean) => {
  if (active === false) return "Inactive";
  if (typeof status === "string") return status;
  return ({ 0: "Pending", 1: "Approved", 2: "Rejected", 3: "Blocked" } as Record<number, string>)[status ?? 0] ?? "Unknown";
};

const VendorProfilePage = () => {
  const { state } = useAdminVendorPortalContext();
  return <div><SectionHeader title="Vendor directory" description="Registered supplier profiles shared with the Tender Portal." />
    <div className="p-6">{state.vendors.length ? <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">{state.vendors.map((vendor) => <article key={vendor.id} className="app-surface p-5"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-700 font-bold text-white">{(vendor.organisationName ?? "V").slice(0, 1).toUpperCase()}</span><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{vendor.organisationName ?? `Vendor #${vendor.id}`}</h3><p className="mt-1 text-xs text-slate-500">{vendor.vendorCode ?? `ID ${vendor.id}`}</p></div></div><StatusBadge status={statusLabel(vendor.status, vendor.isActive)} /></div><dl className="mt-5 grid grid-cols-1 gap-3 text-sm tablet:grid-cols-2"><div><dt className="text-xs font-bold uppercase text-slate-400">Email</dt><dd className="mt-1 break-all font-medium text-slate-700">{vendor.vendorEmail || "—"}</dd></div><div><dt className="text-xs font-bold uppercase text-slate-400">Mobile</dt><dd className="mt-1 font-medium text-slate-700">{vendor.mobile || "—"}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2">{vendor.vendorCategories?.map((category, index) => <span key={category.id ?? category.categoryId ?? index} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{category.categoryName ?? category.name ?? `Category #${category.categoryId ?? "-"}`}</span>)}</div><div className="mt-5 flex justify-end"><Link to={`/vendors/${vendor.id}`} className="app-button-secondary">View full profile</Link></div></article>)}</div> : <EmptyState title="No vendors found" description="Approved and pending vendor registrations will appear here." />}</div>
  </div>;
};

export default VendorProfilePage;
