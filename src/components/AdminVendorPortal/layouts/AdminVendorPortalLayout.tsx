import { Alert, Spin } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import { useVendorPortalState } from "../hooks/useVendorPortalState";

export type AdminVendorPortalContext = ReturnType<typeof useVendorPortalState>;

const AdminVendorPortalLayout = () => {
  const vendorPortal = useVendorPortalState();
  const { state } = vendorPortal;
  const location = useLocation();
  const isBoqImportRoute = location.pathname.startsWith("/vendor-portal/boq-upload");

  return (
    <div className="admin-page">
      <div className="admin-content space-y-6">
        {state.error && <Alert type="error" showIcon message="Vendor portal request failed" description={state.error} />}

        <main className={isBoqImportRoute ? "min-w-0 overflow-hidden" : "admin-panel min-w-0 overflow-hidden"}>
          {!isBoqImportRoute && state.loading ? (
            <div className="flex min-h-[420px] items-center justify-center"><Spin size="large" /></div>
          ) : <Outlet context={vendorPortal} />}
        </main>
      </div>
    </div>
  );
};

export default AdminVendorPortalLayout;
