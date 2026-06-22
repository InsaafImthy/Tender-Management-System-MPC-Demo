import { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useAdminVendorPortalContext } from "../hooks/useAdminVendorPortalContext";
import { formatFileSize, formatMoney } from "../utils/formatters";

const BoqWorkspacePage = () => {
  const { state, uploadBoqFile, updateItemCategory, saveImportedBoms, clearImport } = useAdminVendorPortalContext();
  const uncategorized = state.boqItems.filter((item) => !item.categoryId).length;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await uploadBoqFile(file);
    event.target.value = "";
  };

  return <div>
    <SectionHeader title="BOQ import" description="Parse an Excel or CSV BOQ, validate its rows, assign backend categories, and create real product-list records."
      actions={<>
        <label className="app-button-primary cursor-pointer">Select BOQ<input className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} /></label>
        {state.boqItems.length > 0 && <button type="button" className="app-button-secondary" onClick={clearImport}>Clear</button>}
      </>} />
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">Import status</p><p className="mt-2 font-bold text-slate-900">{state.uploadedFile?.name ?? "No file selected"}</p><p className="mt-1 text-sm text-slate-500">{state.uploadedFile ? `${formatFileSize(state.uploadedFile.size)} · ${state.boqItems.length} valid rows · ${uncategorized} need a category` : "Supported columns include item, code, quantity, unit, price, description, and category."}</p></div>
          <button type="button" disabled={!state.boqItems.length || uncategorized > 0 || state.saving} onClick={() => void saveImportedBoms()} className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50">{state.saving ? "Saving…" : "Create product lists"}</button>
        </div>
      </div>

      {state.boqItems.length > 0 ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-auto"><table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>{["Line", "Code", "Item", "Quantity", "Rate", "Category"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{state.boqItems.map((item) => <tr key={item.id} className="hover:bg-violet-50/30">
            <td className="px-4 py-3 text-sm text-slate-500">{item.lineNo}</td><td className="px-4 py-3 text-sm font-medium text-slate-700">{item.itemCode}</td><td className="px-4 py-3 text-sm font-bold text-slate-900">{item.itemName}</td><td className="px-4 py-3 text-sm text-slate-600">{item.quantity.toLocaleString()}</td><td className="px-4 py-3 text-sm text-slate-600">{formatMoney(item.price)}</td>
            <td className="px-4 py-3"><select aria-label={`Category for ${item.itemName}`} value={item.categoryId ?? ""} onChange={(event) => updateItemCategory(item.id, event.target.value ? Number(event.target.value) : undefined)} className="min-w-48 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"><option value="">Select category</option>{state.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></td>
          </tr>)}</tbody>
        </table></div>
      </div> : <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">{["1. Upload", "2. Validate", "3. Create RFP"].map((title, index) => <div key={title} className="app-surface p-5"><p className="font-bold text-slate-900">{title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{["Choose an Excel or CSV BOQ exported by the buyer.", "Review parsed rows and map each one to a registered category.", "Create product lists here, then use the established RFP form to publish them."][index]}</p></div>)}</div>}

      <div className="flex justify-end"><Link to="/rfps/create-rfp" className="app-button-secondary">Continue to RFP creation</Link></div>
    </div>
  </div>;
};

export default BoqWorkspacePage;
