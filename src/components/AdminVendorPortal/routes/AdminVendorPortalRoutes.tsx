import { Navigate, Route, Routes } from "react-router-dom";
import AdminVendorPortalLayout from "../layouts/AdminVendorPortalLayout";
import AdminBidReviewPage from "../pages/AdminBidReviewPage";
import BoqWorkspacePage from "../pages/BoqWorkspacePage";
import VendorInvitationsPage from "../pages/VendorInvitationsPage";
import VendorPortalDashboard from "../pages/VendorPortalDashboard";
import VendorProfilePage from "../pages/VendorProfilePage";
import VendorRfpsPage from "../pages/VendorRfpsPage";
import VendorSubmissionsPage from "../pages/VendorSubmissionsPage";

const AdminVendorPortalRoutes = () => (
  <Routes>
    <Route element={<AdminVendorPortalLayout />}>
      <Route index element={<VendorPortalDashboard />} />
      <Route path="boq-upload" element={<BoqWorkspacePage />} />
      <Route path="invitations" element={<VendorInvitationsPage />} />
      <Route path="rfps" element={<VendorRfpsPage />} />
      <Route path="submissions" element={<VendorSubmissionsPage />} />
      <Route path="bid-review" element={<AdminBidReviewPage />} />
      <Route path="vendors" element={<VendorProfilePage />} />
      <Route path="*" element={<Navigate to="/vendor-portal" replace />} />
    </Route>
  </Routes>
);

export default AdminVendorPortalRoutes;
