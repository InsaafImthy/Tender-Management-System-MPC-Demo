import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavItem } from "../../types/Types";
import procurementLogo from "../../assets/procurement_logo/Muscat-Pharmacy-logo.png";
import {
  AnalysisIcon,
  BellIcon,
  ClipboardIcon,
  DeliveryDetailsIcon,
  DocumentTextIcon,
  HomeIcon,
  PurchaseIcon,
  SettingsIcon,
  UpcomingTendorsIcon,
  UserIcon,
} from "../../utils/Icons";
import Modal from "./Modal";
import NotificationContent from "../dashboard/NotificationContent";
import "./sidebarStyle.css";
import { INotificationItem } from "../../types/commonTypes";

type FlyoutKey = "vendorPortal" | "settings" | null;

interface SidebarProp {
  notifications: INotificationItem[];
  trigger: () => void;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  onDesktopOffsetChange?: (offset: number) => void;
}

interface SectionItem {
  to: string;
  title: string;
}

const COLLAPSED_WIDTH = 82;
const PRIMARY_EXPANDED_WIDTH = 272;
const SECONDARY_PANEL_WIDTH = 236;

const Sidebar = ({
  notifications,
  trigger,
  isExpanded,
  onExpandedChange,
  onDesktopOffsetChange,
}: SidebarProp) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string>("");
  const [activeFlyout, setActiveFlyout] = useState<FlyoutKey>(null);

  const navItems: NavItem[] = [
    { to: "/", title: "Dashboard", icon: HomeIcon },
    { to: "/rfps", title: "Tender Requests", icon: ClipboardIcon },
    { to: "/vendors", title: "Vendors", icon: DocumentTextIcon },
    { to: "/upcoming-tenders", title: "Upcoming Tenders", icon: UpcomingTendorsIcon },
    { to: "/delivery-details", title: "Delivery Details", icon: DeliveryDetailsIcon },
    { to: "/competitor-analysis", title: "Competitor Analysis", icon: AnalysisIcon },
    { to: "/purchase-requistition", title: "Purchase Requisition", icon: PurchaseIcon },
  ];

  const bottomItems: NavItem[] = [
    {
      to: "",
      title: "Notifications",
      icon: BellIcon,
      onClick: () => {
        setActiveIcon("Notifications");
        setIsModalOpen(true);
      },
    },
    { to: "/profile", title: "User Profile", icon: UserIcon },
  ];

  const vendorPortalItems: SectionItem[] = [
    { to: "/vendor-portal", title: "Overview" },
    { to: "/vendor-portal/boq-upload", title: "BOQ Import" },
    { to: "/vendor-portal/rfps", title: "Vendor RFPs" },
    { to: "/vendor-portal/invitations", title: "Vendor Interest" },
    { to: "/vendor-portal/submissions", title: "Submitted Bids" },
    { to: "/vendor-portal/bid-review", title: "Bid Review" },
    { to: "/vendor-portal/vendors", title: "Vendor Directory" },
  ];

  const settingsItems: SectionItem[] = [
    { to: "/settings/user-managment", title: "User management" },
    { to: "/settings/category-managment", title: "Category management" },
    { to: "/settings/department-managment", title: "Manage department" },
    { to: "/settings/roles-managment", title: "Roles & permissions" },
    { to: "/settings/workflow-managment", title: "Approval workflow" },
    { to: "/settings/criteria-managment", title: "Criteria management" },
    { to: "/settings/questionnaire-managment", title: "Questionnaire management" },
    { to: "/settings/bom-managment", title: "Product list management" },
  ];

  const isVendorPortalActive = currentPath.startsWith("/vendor-portal");
  const isSettingsActive = currentPath.startsWith("/settings");

  const flyoutConfig = {
    vendorPortal: {
      title: "Vendor Portal",
      subtitle: "Tender workspace",
      items: vendorPortalItems,
    },
    settings: {
      title: "Settings",
      subtitle: "System preferences",
      items: settingsItems,
    },
  } as const;

  const handleModalClose = () => {
    setIsModalOpen(false);
    updateActiveIconFromPath();
  };

  const updateActiveIconFromPath = () => {
    for (const item of [...navItems, ...bottomItems]) {
      if (!item.to) continue;

      if (item.title === "Vendors" && currentPath.startsWith("/vendors")) {
        setActiveIcon("Vendors");
        return;
      }

      if (item.title === "Tender Requests" && (currentPath.startsWith("/rfps") || currentPath.startsWith("/request"))) {
        setActiveIcon("Tender Requests");
        return;
      }

      if ((item.to === "/" && currentPath === "/") || (item.to !== "/" && currentPath === item.to)) {
        setActiveIcon(item.title);
        return;
      }
    }

    if (currentPath.startsWith("/vendor-portal")) {
      setActiveIcon("Vendor Portal");
      return;
    }

    if (currentPath.startsWith("/settings")) {
      setActiveIcon("Settings");
      return;
    }

    setActiveIcon("");
  };

  useEffect(() => {
    updateActiveIconFromPath();
  }, [currentPath]);

  useEffect(() => {
    if (currentPath.startsWith("/vendor-portal")) {
      setActiveFlyout("vendorPortal");
      return;
    }

    if (currentPath.startsWith("/settings")) {
      setActiveFlyout("settings");
      return;
    }

    setActiveFlyout(null);
  }, [currentPath]);

  useEffect(() => {
    if (!isExpanded) {
      setActiveFlyout(null);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  const desktopOffset = isExpanded
    ? PRIMARY_EXPANDED_WIDTH + (activeFlyout ? SECONDARY_PANEL_WIDTH : 0)
    : COLLAPSED_WIDTH;

  useEffect(() => {
    onDesktopOffsetChange?.(desktopOffset);
  }, [desktopOffset, onDesktopOffsetChange]);

  const linkClasses = (active: boolean) =>
    `sidebar-link group flex h-11 items-center rounded-xl border px-3.5 transition-all duration-200 ${
      isExpanded ? "w-full justify-start gap-3" : "w-[42px] justify-center px-2 border-transparent"
    } ${
      active
        ? "border-violet-700 bg-violet-700 text-white shadow-[0_12px_24px_rgba(109,40,217,0.24)]"
        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
    }`;

  const sectionTriggerClasses = (selected: boolean, open: boolean) =>
    `sidebar-link group flex h-11 items-center rounded-xl border px-3.5 transition-all duration-200 ${
      isExpanded ? "w-full justify-start gap-3" : "w-[42px] justify-center px-2 border-transparent"
    } ${
      selected
        ? "border-violet-700 bg-violet-700 text-white shadow-[0_12px_24px_rgba(109,40,217,0.24)]"
        : open
          ? "border-slate-200 bg-white text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
          : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
    }`;

  const Nav_Link = ({
    to,
    title,
    icon: Icon,
    onClick,
  }: {
    to?: string;
    title: string;
    icon: React.ElementType;
    onClick?: () => void;
  }) => {
    const isActive = activeIcon === title;
    const isRequestsActive =
      title === "Tender Requests" && (currentPath.startsWith("/rfps") || currentPath.startsWith("/request"));

    const linkContent = (active: boolean) => (
      <>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon className={`h-6 w-6 ${active ? "stroke-white" : "stroke-slate-500 group-hover:stroke-slate-800"} transition-colors duration-200`} />
        </span>
        {isExpanded && (
          <span className="min-w-0 truncate text-sm font-medium tracking-tight">{title}</span>
        )}
      </>
    );

    const handleClick = () => {
      setActiveFlyout(null);
      onClick?.();
    };

    if (!to) {
      return (
        <button aria-label={title} onClick={handleClick} className={linkClasses(isActive)}>
          {linkContent(isActive)}
        </button>
      );
    }

    if (title === "Tender Requests") {
      return (
        <NavLink
          to={to}
          aria-label={title}
          onClick={handleClick}
          className={({ isActive: navActive }) => linkClasses(navActive || isRequestsActive)}
        >
          {({ isActive: navActive }) => linkContent(navActive || isRequestsActive)}
        </NavLink>
      );
    }

    return (
      <NavLink
        to={to}
        aria-label={title}
        onClick={handleClick}
        className={({ isActive: navActive }) => linkClasses(navActive)}
      >
        {({ isActive: navActive }) => linkContent(navActive)}
      </NavLink>
    );
  };

  const Nav_SectionTrigger = ({
    title,
    icon: Icon,
    sectionKey,
    isActive,
  }: {
    title: string;
    icon: React.ElementType;
    sectionKey: Exclude<FlyoutKey, null>;
    isActive: boolean;
  }) => {
    const isOpen = activeFlyout === sectionKey;

    return (
    <button
      type="button"
      aria-label={title}
      aria-expanded={isExpanded ? isOpen : undefined}
      onClick={() => {
        if (!isExpanded) {
          onExpandedChange(true);
          setActiveFlyout(sectionKey);
          return;
        }

        setActiveFlyout((current) => (current === sectionKey ? null : sectionKey));
      }}
      className={sectionTriggerClasses(isActive, isOpen)}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Icon className={`h-6 w-6 ${isActive ? "stroke-white" : isOpen ? "stroke-slate-800" : "stroke-slate-500 group-hover:stroke-slate-800"} transition-colors duration-200`} />
      </span>
      {isExpanded && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium tracking-tight">
            {title}
          </span>
          <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : isOpen ? "text-slate-700" : "text-slate-400 group-hover:text-slate-700"} transition-transform duration-200`} />
        </>
      )}
    </button>
    );
  };

  const activeFlyoutContent = activeFlyout ? flyoutConfig[activeFlyout] : null;

  return (
    <>
      <div className="fixed left-0 top-0 z-10 flex h-screen">
        <main
          id="sidebar-main"
          className={`flex h-screen overflow-visible border-r border-slate-200/80 bg-white/95 shadow-[8px_0_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-[width] duration-300 ease-in-out ${isExpanded ? "sidebar-expanded w-[272px]" : "w-[82px]"}`}
        >
          <section className={`flex min-h-0 flex-1 flex-col ${isExpanded ? "px-4 py-4" : "px-5 py-4"}`}>
            <div className={`mb-4 flex h-14 items-center ${isExpanded ? "justify-between gap-3" : "justify-center"}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-white shadow-sm">
                  <img src={procurementLogo} alt="Logo" className="h-[34px] w-[34px]" />
                </div>
                {isExpanded && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">Procurement</p>
                    <p className="truncate text-xs text-slate-500">Admin Portal</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onExpandedChange(!isExpanded)}
                className={`sidebar-toggle z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isExpanded ? "" : "absolute left-[64px]"}`}
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <PanelLeftClose className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-[18px] w-[18px]" />}
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto overflow-x-hidden pb-4 ${isExpanded ? "pr-3" : "pr-1"} sidebar-scroll`}>
              <div className="space-y-1.5">
                {navItems.map(({ to, title, icon }) => (
                  <Nav_Link key={title} to={to} title={title} icon={icon} />
                ))}
                <Nav_SectionTrigger
                  title="Vendor Portal"
                  icon={DocumentTextIcon}
                  sectionKey="vendorPortal"
                  isActive={isVendorPortalActive}
                />
                <Nav_SectionTrigger
                  title="Settings"
                  icon={SettingsIcon}
                  sectionKey="settings"
                  isActive={isSettingsActive}
                />
              </div>
            </div>

            <section className={`shrink-0 space-y-1.5 border-t border-slate-200/80 pt-3 ${isExpanded ? "" : ""}`}>
              {bottomItems.map(({ to, title, icon, onClick }) => {
                const hasUnreadNotifications = title === "Notifications" && notifications.some((notification) => notification.isRead == false);

                return hasUnreadNotifications ? (
                  <div key={title} className="relative">
                    <Nav_Link to={to} title={title} icon={icon} onClick={onClick} />
                    <span className={`absolute top-2 inline-flex h-2 w-2 items-center justify-center rounded-full bg-red-500 ${isExpanded ? "left-8" : "right-1"}`}></span>
                  </div>
                ) : (
                  <Nav_Link key={title} to={to} title={title} icon={icon} onClick={onClick} />
                );
              })}
            </section>
          </section>
        </main>

        {isExpanded && activeFlyoutContent && (
          <aside className="flex h-screen w-[236px] shrink-0 border-r border-slate-200/80 bg-[#fcfcfd] px-4 py-4 shadow-[10px_0_28px_rgba(15,23,42,0.05)]">
            <div className="flex min-h-0 w-full flex-col rounded-[20px] border border-slate-200/80 bg-white/80 p-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-200/80 px-2 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {activeFlyoutContent.subtitle}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {activeFlyoutContent.title}
                </h3>
              </div>

              <div className="sidebar-scroll mt-3 min-h-0 flex-1 overflow-y-auto pr-2">
                <nav className="space-y-1" aria-label={`${activeFlyoutContent.title} links`}>
                  {activeFlyoutContent.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/vendor-portal"}
                      className={({ isActive }) =>
                        `flex min-h-11 items-center rounded-xl border px-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "border-violet-100 bg-violet-50 text-violet-800 shadow-[0_8px_18px_rgba(109,40,217,0.10)]"
                            : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)]"
                        }`
                      }
                    >
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </aside>
        )}
      </div>

      <Modal
        title="Notifications"
        modalPosition="end"
        content={<NotificationContent data={notifications} closeModal={handleModalClose} trigger={trigger} />}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        width="40%"
      />
    </>
  );
};

export default Sidebar;
