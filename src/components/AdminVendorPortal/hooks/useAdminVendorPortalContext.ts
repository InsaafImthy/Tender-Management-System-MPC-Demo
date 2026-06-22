import { useOutletContext } from "react-router-dom";
import { AdminVendorPortalContext } from "../layouts/AdminVendorPortalLayout";

export const useAdminVendorPortalContext = () =>
  useOutletContext<AdminVendorPortalContext>();
