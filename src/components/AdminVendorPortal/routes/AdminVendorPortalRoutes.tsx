import { Navigate, Route, Routes } from "react-router-dom";
import AdminVendorPortalLayout from "../layouts/AdminVendorPortalLayout";
import AdminBidReviewPage from "../pages/AdminBidReviewPage";
import BOQIntakePage from "../boq_intake/BOQIntakePage";
import DraftRFPReviewPage from "../boq_intake/DraftRFPReviewPage";
import ExtractedBOQReviewPage from "../boq_intake/ExtractedBOQReviewPage";
import VendorInvitationsPage from "../pages/VendorInvitationsPage";
import VendorProfilePage from "../pages/VendorProfilePage";
import VendorRfpsPage from "../pages/VendorRfpsPage";
import VendorSubmissionsPage from "../pages/VendorSubmissionsPage";

const AdminVendorPortalRoutes = () => (
  <Routes>
    <Route element={<AdminVendorPortalLayout />}>
      <Route index element={<Navigate to="rfps" replace />} />
      <Route path="boq-upload" element={<BOQIntakePage />} />
      <Route path="boq-upload/review/:sessionId" element={<ExtractedBOQReviewPage />} />
      <Route path="boq-upload/drafts/:draftId" element={<DraftRFPReviewPage />} />
      <Route path="invitations" element={<VendorInvitationsPage />} />
      <Route path="rfps" element={<VendorRfpsPage />} />
      <Route path="submissions" element={<VendorSubmissionsPage />} />
      <Route path="bid-review" element={<AdminBidReviewPage />} />
      <Route path="vendors" element={<VendorProfilePage />} />
      <Route path="*" element={<Navigate to="/vendor-portal/rfps" replace />} />
    </Route>
  </Routes>
);

export default AdminVendorPortalRoutes;
