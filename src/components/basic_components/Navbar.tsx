import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import procurementLogo from "../../assets/procurement_logo/Muscat-Pharmacy-logo.png";
import {
  BellIcon,
  ClipboardIcon,
  DocumentTextIcon,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
} from "../../utils/Icons";
import { NavItem } from "../../types/Types";
import Modal from "./Modal"; // Assuming Modal is a separate component
import NotificationContent from "../dashboard/NotificationContent"; // Assuming NotificationContent is the content of the modal
import { INotificationItem } from "../../types/commonTypes";

interface NavbarProp{
  notifications:INotificationItem[];
  trigger:()=>void
}

const Navbar = ({ notifications,trigger }: NavbarProp) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state


  // Navigation items
  const navItems: NavItem[] = [
    { to: "/", title: "Dashboard", icon: HomeIcon },
    { to: "/rfps", title: "Requests", icon: ClipboardIcon },
    { to: "/vendors", title: "Vendors", icon: DocumentTextIcon },
    { to: "/vendor-portal", title: "Vendor Portal", icon: DocumentTextIcon },
    { to: "/settings/user-managment", title: "Settings", icon: SettingsIcon },
  ];

  const bottomItems: NavItem[] = [
    { to: "/profile", title: "User Profile", icon: UserIcon },
  ];

  // Props type for Nav_Link
  interface NavLinkProps {
    to?: string; // optional for flexibility
    title: string;
    icon: React.ElementType; // The component type for the icon
    onClick?: () => void;
  }

  const Nav_Link: React.FC<NavLinkProps> = ({ to, title, icon: Icon, onClick }) => (
    <NavLink
      to={to || "#"} // Default to "#" if no `to` provided
      title={title}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-violet-50 hover:text-violet-800 rounded-lg transition-all duration-200"
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-semibold">{title}</span>
    </NavLink>
  );

  return (
    <div className="fixed top-0 left-0 w-full bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,0.08)] border-b border-slate-200/80 backdrop-blur-xl z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 shadow-sm">
          <img src={procurementLogo} alt="Logo" className="w-8 h-8" />
        </div>

        {/* Menu Icon for Mobile */}
        <button
          className="p-2 rounded-lg text-slate-600 hover:bg-violet-50 hover:text-violet-800 transition-all duration-200"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Dropdown Menu for Mobile */}
      {isDropdownOpen && (
        <div className="bg-white/95 border-t border-slate-100 shadow-xl p-4">
          {/* Navigation Links */}
          <div className="space-y-2">
            {navItems.map(({ to, title, icon }) => (
              <Nav_Link
                key={title}
                to={to}
                title={title}
                icon={icon}
                onClick={() => setIsDropdownOpen(false)}
              />
            ))}

            {/* Bottom Items */}
            <div className="border-t pt-2">
              {bottomItems.map(({ to, title, icon }) => (
                <Nav_Link
                  key={title}
                  to={to}
                  title={title}
                  icon={icon}
                  onClick={() => setIsDropdownOpen(false)}
                />
              ))}

              {/* Notifications (Open Modal) */}
              <div className="relative inline-block">
                <Nav_Link
                  key="Notifications"
                  to={undefined} // No route, just opens modal
                  title="Notifications"
                  icon={BellIcon}
                  onClick={() => {
                    setIsModalOpen(true); // Open the notification modal
                    setIsDropdownOpen(false); // Close the dropdown
                  }}
                />
                {notifications.some(n=>!n.isRead) && <span className="absolute top-2 right-3 inline-flex items-center justify-center w-2 h-2 text-xs text-white bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2">
                </span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Notifications */}
      <Modal
        title="Notifications"
        modalPosition="start"
        content={<NotificationContent data={notifications} closeModal={() => setIsModalOpen(false)} trigger={trigger} />} // Assuming NotificationContent displays the notification list
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="40%"
      />
    </div>
  );
};

export default Navbar;
