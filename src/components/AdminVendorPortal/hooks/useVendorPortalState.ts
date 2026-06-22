import { useCallback, useEffect, useState } from "react";
import {
  createImportedBoms,
  loadVendorPortalData,
  parseBoqFile,
  publishPortalRfp,
  reviewPortalProposal,
} from "../services/vendorPortalService";
import { VendorPortalState } from "../types/vendorPortalTypes";

const initialState: VendorPortalState = {
  boqItems: [], categories: [], boms: [], rfps: [], interests: [], proposals: [], vendors: [], loading: true, saving: false,
};

export const useVendorPortalState = () => {
  const [state, setState] = useState<VendorPortalState>(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const data = await loadVendorPortalData();
      setState((current) => ({ ...current, ...data, loading: false, saving: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "Unable to load vendor portal data." }));
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const runAction = async (action: () => Promise<unknown>) => {
    setState((current) => ({ ...current, saving: true, error: undefined }));
    try {
      await action();
      await refresh();
      return true;
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error instanceof Error ? error.message : "The operation failed." }));
      return false;
    }
  };

  return {
    state,
    refresh,
    uploadBoqFile: async (file: File) => {
      setState((current) => ({ ...current, saving: true, error: undefined }));
      try {
        const boqItems = await parseBoqFile(file, state.categories);
        setState((current) => ({ ...current, boqItems, uploadedFile: { name: file.name, size: file.size, uploadedAt: new Date().toISOString() }, saving: false }));
        return true;
      } catch (error) {
        setState((current) => ({ ...current, saving: false, error: error instanceof Error ? error.message : "Unable to read the BOQ file." }));
        return false;
      }
    },
    updateItemCategory: (itemId: string, categoryId?: number) => setState((current) => ({
      ...current,
      boqItems: current.boqItems.map((item) => item.id === itemId ? { ...item, categoryId } : item),
    })),
    saveImportedBoms: () => state.uploadedFile
      ? runAction(() => createImportedBoms(state.boqItems, state.categories, state.uploadedFile!.name))
      : Promise.resolve(false),
    publishRfp: (rfpId: number) => runAction(() => publishPortalRfp(rfpId)),
    reviewProposal: (proposalId: number, status: "Pending" | "Approved" | "Rejected") =>
      runAction(() => reviewPortalProposal(proposalId, status)),
    clearImport: () => setState((current) => ({ ...current, boqItems: [], uploadedFile: undefined, error: undefined })),
  };
};
