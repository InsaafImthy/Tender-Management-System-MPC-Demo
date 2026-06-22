import { Alert, Spin } from "antd";
import { Outlet } from "react-router-dom";
import { useVendorPortalState } from "../hooks/useVendorPortalState";

export type AdminVendorPortalContext = ReturnType<typeof useVendorPortalState>;

const AdminVendorPortalLayout = () => {
  const vendorPortal = useVendorPortalState();
  const { state } = vendorPortal;

  return (
    <div className="admin-page">
      <div className="admin-content space-y-6">
        <header className="admin-page-header">
          <div className="admin-page-header-row">
            <div className="admin-title-cluster">
              <span className="admin-eyebrow">Vendor operations</span>
              <h1 className="admin-page-title">Vendor Tender Portal</h1>
              <p className="admin-page-description">Monitor vendor-facing tenders, proposals, interests, and imported BOQs from one live admin workspace.</p>
            </div>
            <button type="button" onClick={() => void vendorPortal.refresh()} disabled={state.loading} className="app-button-secondary">
              Refresh data
            </button>
          </div>
        </header>

        {state.error && <Alert type="error" showIcon message="Vendor portal request failed" description={state.error} />}

        <main className="admin-panel min-w-0 overflow-hidden">
          {state.loading ? (
            <div className="flex min-h-[420px] items-center justify-center"><Spin size="large" /></div>
          ) : <Outlet context={vendorPortal} />}
        </main>
      </div>
    </div>
  );
};

export default AdminVendorPortalLayout;
