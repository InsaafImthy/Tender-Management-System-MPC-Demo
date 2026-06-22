import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

interface SidebarProp{
  notifications:INotificationItem[];
  trigger:()=>void;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
}

const Sidebar = ({ notifications, trigger, isExpanded, onExpandedChange }: SidebarProp) => {
  const location = useLocation(); // Get current location
  const currentPath = location.pathname;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string>("");
  const [isVendorPortalOpen, setIsVendorPortalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Navigation Items Configuration
  const navItems: NavItem[] = [
    { to: "/", title: "Dashboard", icon: HomeIcon },
    { to: "/rfps", title: "Tender Requests", icon: ClipboardIcon },
    { to: "/vendors", title: "Vendors", icon: DocumentTextIcon },
    { to: "/vendor-portal", title: "Vendor Portal", icon: DocumentTextIcon },
    { to: "/upcoming-tenders", title: "Upcoming Tenders", icon: UpcomingTendorsIcon },
    { to: "/delivery-details", title: "Delivery Details", icon: DeliveryDetailsIcon },
    { to: "/competitor-analysis", title: "Competitor Analysis", icon: AnalysisIcon },
    { to: "/purchase-requistition", title: "Purchase Requisition", icon: PurchaseIcon },
    { to: "/settings/user-managment", title: "Settings", icon: SettingsIcon },
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

  const vendorPortalItems = [
    { to: "/vendor-portal", title: "Overview" },
    { to: "/vendor-portal/boq-upload", title: "BOQ Import" },
    { to: "/vendor-portal/rfps", title: "Vendor RFPs" },
    { to: "/vendor-portal/invitations", title: "Vendor Interest" },
    { to: "/vendor-portal/submissions", title: "Submitted Bids" },
    { to: "/vendor-portal/bid-review", title: "Bid Review" },
    { to: "/vendor-portal/vendors", title: "Vendor Directory" },
  ];

  const settingsItems = [
    { to: "/settings/user-managment", title: "User management" },
    { to: "/settings/category-managment", title: "Category management" },
    { to: "/settings/department-managment", title: "Manage department" },
    { to: "/settings/roles-managment", title: "Roles & permissions" },
    { to: "/settings/workflow-managment", title: "Approval workflow" },
    { to: "/settings/criteria-managment", title: "Criteria management" },
    { to: "/settings/questionnaire-managment", title: "Questionnaire management" },
    { to: "/settings/bom-managment", title: "Product list management" },
  ];

  // Function to handle modal close - resets active icon to match current path
  const handleModalClose = () => {
    setIsModalOpen(false);

    // Reset the active icon based on current path
    updateActiveIconFromPath();
  };

  // Function to update active icon based on current path
  const updateActiveIconFromPath = () => {
    // Find which navigation item matches the current path
    for (const item of [...navItems, ...bottomItems]) {
      if (!item.to) continue;

      // Special case for settings - check if path starts with '/settings'
      if (item.title === "Settings" && currentPath.startsWith("/settings")) {
        setActiveIcon("Settings");
        return;
      }

      // Special case for spend_analysys - check if path starts with '/spend_analysys'
      if (item.title === "Vendors" && currentPath.startsWith("/vendors")) {
        setActiveIcon("Vendors");
        return;
      }

      // Special case for requests - check if path starts with '/requests' or '/request'
      if (item.title === "Tender Requests" && (currentPath.startsWith("/rfps") || currentPath.startsWith("/request"))) {
        setActiveIcon("Tender Requests");
        return;
      }

      // For other routes, exact match (or home route)
      if ((item.to === "/" && currentPath === "/") ||
        (item.to !== "/" && currentPath === item.to)) {
        setActiveIcon(item.title);
        return;
      }
    }
  };

  // Update active icon based on current path
  useEffect(() => {
    updateActiveIconFromPath();
  }, [currentPath]);

  useEffect(() => {
    if (currentPath.startsWith("/vendor-portal")) {
      setIsVendorPortalOpen(true);
    }

    if (currentPath.startsWith("/settings")) {
      setIsSettingsOpen(true);
    }
  }, [currentPath]);

  useEffect(() => {
    if (!isExpanded) {
      setIsVendorPortalOpen(false);
      setIsSettingsOpen(false);
    } else {
      if (currentPath.startsWith("/vendor-portal")) {
        setIsVendorPortalOpen(true);
      }
      if (currentPath.startsWith("/settings")) {
        setIsSettingsOpen(true);
      }
    }
  }, [isExpanded, currentPath]);

  //hide scroll-bar when modal open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  const linkClasses = (active: boolean) =>
    `sidebar-link flex h-[42px] items-center ${isExpanded ? "w-full justify-start gap-3 px-3" : "w-[42px] justify-center px-2"} py-1 ${
      active
        ? "bg-violet-700 text-white shadow-[0_10px_22px_rgba(109,40,217,0.28)]"
        : "text-slate-500"
    } hover:bg-violet-50 hover:text-violet-800 rounded-xl transition-all duration-200 group`;

  // Reusable Navigation Link Component
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
    // Determine if this nav item is active
    const isActive = activeIcon === title;

    // For settings, add special check for paths that start with /settings
    const isSettingsActive =
      title === "Settings" && currentPath.startsWith("/settings");

    // For spend_analysys, add special check for paths that start with /spend_analysys
    const isSpendAnalysysActive =
      title === "spend analysys" && currentPath.startsWith("/spend_analysys");

    // For requests, add special check for paths that start with /requests or /request
    const isRequestsActive =
      title === "Tender Requests" && (currentPath.startsWith("/rfps") || currentPath.startsWith("/request"));

    const linkContent = (active: boolean) => (
      <>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon className={`w-[24px] h-[24px] ${active ? "stroke-white" : "stroke-slate-500 group-hover:stroke-violet-800"} transition-colors duration-200`} />
        </span>
        {isExpanded && (
          <span className="min-w-0 truncate text-sm font-medium tracking-tight">
            {title}
          </span>
        )}
      </>
    );

    const handleClick = () => {
      if (onClick) onClick();
    };

    if (!to) {
      return (
        <button
          aria-label={title}
          onClick={handleClick}
          className={linkClasses(isActive)}
        >
          {linkContent(isActive)}
        </button>
      );
    }

    // For settings, spend analysys, and requests, use custom isActive logic
    if (title === "Settings" || title === "spend analysys" || title === "Tender Requests") {
      return (
        <NavLink
          to={to}
          aria-label={title}
          onClick={handleClick}
          className={({ isActive }) =>
            linkClasses(isActive || isSettingsActive || isSpendAnalysysActive || isRequestsActive)
          }
        >
          {({ isActive }) =>
            linkContent(isActive || isSettingsActive || isSpendAnalysysActive || isRequestsActive)
          }
        </NavLink>
      );
    }

    // For other nav items
    return (
      <NavLink
        to={to}
        aria-label={title}
        onClick={handleClick}
        className={({ isActive }) => linkClasses(isActive)}
      >
        {({ isActive }) => linkContent(isActive)}
      </NavLink>
    );
  };

  const Nav_Dropdown = ({
    title,
    icon: Icon,
    items,
    isOpen,
    onToggle,
    isSectionActive,
  }: {
    title: string;
    icon: React.ElementType;
    items: { to: string; title: string }[];
    isOpen: boolean;
    onToggle: () => void;
    isSectionActive: boolean;
  }) => (
    <div className="space-y-1">
      <button
        type="button"
        aria-label={title}
        aria-expanded={isExpanded ? isOpen : undefined}
        onClick={() => {
          if (isExpanded) {
            onToggle();
            return;
          }

          onExpandedChange(true);
        }}
        className={linkClasses(isSectionActive)}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
          <Icon className={`w-[24px] h-[24px] ${isSectionActive ? "stroke-white" : "stroke-slate-500 group-hover:stroke-violet-800"} transition-colors duration-200`} />
        </span>
        {isExpanded && (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium tracking-tight">
              {title}
            </span>
            {isOpen ? (
              <ChevronDown className={`h-4 w-4 shrink-0 ${isSectionActive ? "text-white" : "text-slate-400 group-hover:text-violet-700"} transition-colors duration-200`} />
            ) : (
              <ChevronRight className={`h-4 w-4 shrink-0 ${isSectionActive ? "text-white" : "text-slate-400 group-hover:text-violet-700"} transition-colors duration-200`} />
            )}
          </>
        )}
      </button>

      {isExpanded && isOpen && (
        <div className="ml-4 space-y-1 border-l border-violet-100 pl-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/vendor-portal"}
              className={({ isActive }) =>
                `flex min-h-9 items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-violet-50 text-violet-800"
                    : "text-slate-500 hover:bg-violet-50 hover:text-violet-800"
                }`
              }
            >
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );

  const topLevelItems = navItems.filter(
    ({ title }) => title !== "Vendor Portal" && title !== "Settings"
  );

  const isVendorPortalActive = currentPath.startsWith("/vendor-portal");
  const isSettingsActive = currentPath.startsWith("/settings");

  return (
    <>
      {/* Desktop Sidebar */}
      <main
        id="sidebar-main"
        className={`flex ${isExpanded ? "sidebar-expanded w-[260px]" : "w-[82px]"} z-10 h-screen fixed left-0 top-0 border-r border-slate-200/80 flex-col justify-between bg-white/95 shadow-[8px_0_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-[width] duration-300 ease-in-out`}
      >
        <section className={`min-h-0 w-full ${isExpanded ? "px-4" : "px-5"}`}>
          {/* Logo */}
          <div className={`my-[22px] flex h-14 items-center ${isExpanded ? "justify-between" : "justify-center"}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 shadow-sm">
              <img src={procurementLogo} alt="Logo" className="w-[34px] h-[34px]" />
            </div>
            {isExpanded && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">Procurement</p>
                <p className="truncate text-xs text-slate-500">Admin Portal</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => onExpandedChange(!isExpanded)}
              className={`sidebar-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${isExpanded ? "ml-2" : "absolute left-[64px]"}`}
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <PanelLeftClose className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-[18px] w-[18px]" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 overflow-y-auto overflow-x-hidden pb-2">
            {topLevelItems.map(({ to, title, icon }) => (
              <Nav_Link key={title} to={to} title={title} icon={icon} />
            ))}
            <Nav_Dropdown
              title="Vendor Portal"
              icon={DocumentTextIcon}
              items={vendorPortalItems}
              isOpen={isVendorPortalOpen}
              onToggle={() => setIsVendorPortalOpen((prev) => !prev)}
              isSectionActive={isVendorPortalActive}
            />
            <Nav_Dropdown
              title="Settings"
              icon={SettingsIcon}
              items={settingsItems}
              isOpen={isSettingsOpen}
              onToggle={() => setIsSettingsOpen((prev) => !prev)}
              isSectionActive={isSettingsActive}
            />
          </div>
        </section>

        {/* Bottom Section */}
        <section className={`w-full space-y-2 pb-4 ${isExpanded ? "px-4" : "px-5"}`}>
          {bottomItems.map(({ to, title, icon, onClick }) => (
            (title == "Notifications" && notifications.some(n=>n.isRead == false)) ?
              <div className="relative">
                <Nav_Link key={title} to={to} title={title} icon={icon} onClick={onClick} />
                <span className={`absolute top-2 inline-flex h-2 w-2 items-center justify-center rounded-full bg-red-500 ${isExpanded ? "left-8" : "right-1"}`}>
                </span>
              </div>
              : <Nav_Link key={title} to={to} title={title} icon={icon} onClick={onClick} />
          ))}
        </section>
      </main>

      {/* Modal */}
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
