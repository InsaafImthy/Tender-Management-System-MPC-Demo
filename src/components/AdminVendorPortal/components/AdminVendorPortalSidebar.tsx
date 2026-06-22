import { BadgeCheck, Boxes, ClipboardList, FileText, LayoutDashboard, Send, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/vendor-portal", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/vendor-portal/boq-upload", label: "BOQ Import", icon: Boxes },
  { to: "/vendor-portal/rfps", label: "Vendor RFPs", icon: FileText },
  { to: "/vendor-portal/invitations", label: "Vendor Interest", icon: Send },
  { to: "/vendor-portal/submissions", label: "Submitted Bids", icon: ClipboardList },
  { to: "/vendor-portal/bid-review", label: "Bid Review", icon: BadgeCheck },
  { to: "/vendor-portal/vendors", label: "Vendor Directory", icon: UsersRound },
];

const AdminVendorPortalSidebar = () => (
  <aside className="app-surface h-fit p-3 desktop:sticky desktop:top-6">
    <div className="border-b border-violet-100 px-3 pb-4 pt-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Live workspace</p>
      <p className="mt-1 text-sm text-slate-500">Tender Portal integration</p>
    </div>
    <nav className="mt-3 space-y-1" aria-label="Vendor portal sections">
      {navigationItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) =>
          `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${isActive
            ? "bg-violet-700 text-white shadow-[0_8px_20px_rgba(109,40,217,0.22)]"
            : "text-slate-600 hover:bg-violet-50 hover:text-violet-800"}`
        }>
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminVendorPortalSidebar;
