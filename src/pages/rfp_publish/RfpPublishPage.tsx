import { useCallback, useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import PageLoader from "../../components/basic_components/PageLoader";
import { IFilterDto } from "../../types/commonTypes";
import { rfp_column_labels, rfpStatuses } from "../../utils/constants";
import { getAllRfpsByFilterAsync, publishRfpAsync } from "../../services/rfpService";
import { getAllCategoriesAsync } from "../../services/categoryService";

const defaultFilter: IFilterDto = {
    fields: [
        { columnName: "status", operator: "=", value: 1 }, // Approved
    ],
    sortColumn: "CreatedAt",
    sortDirection: "DESC",
    pageNo: 1,
    pageSize: 50,
};

const columns = [
    "tenderNumber",
    "rfpTitle",
    "buyerName",
    "estimatedContractValueLabel",
    "status",
] as const;
type ColumnKey = typeof columns[number];

export default function RfpPublishPage() {
  const [filter, setFilter] = useState<IFilterDto>(defaultFilter);
  const [items, setItems] = useState<any[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, ] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setShowLoader(true);
      const resp = await getAllRfpsByFilterAsync({
        ...filter,
        globalSearch: searchQuery,
      });
      let mapped = (resp || [])
        .filter((r: any) => r.status === 1)
        .map((r: any) => ({
          ...r,
          estimatedContractValueLabel: r.estimatedContractValue,
        }));
      if (selectedCategoryId != null) {
        mapped = mapped.filter((r: any) => {
          const directMatch = typeof r.categoryId === "number" && r.categoryId === selectedCategoryId;
          const arrayMatch = Array.isArray(r.rfpCategories) && r.rfpCategories.some((c: any) => Number(c.categoryId) === selectedCategoryId);
          return directMatch || arrayMatch;
        });
      }
      setItems(mapped);
    } finally {
      setShowLoader(false);
    }
  }, [filter, searchQuery, selectedCategoryId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);
        const cats = await getAllCategoriesAsync();
        setCategories(cats || []);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  const onCategoryChange = (val: number | null) => {
    setSelectedCategoryId(val);
    const baseFields = defaultFilter.fields.slice();
    const nextFields = val == null ? baseFields : [...baseFields, { columnName: "categoryId", operator: "=", value: Number(val) }];
    setFilter((f) => ({ ...f, fields: nextFields }));
  };

  const allSelected = useMemo(() => items.length > 0 && items.every((r) => selectedIds.has(r.id)), [items, selectedIds]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    const next = new Set<number>();
    items.forEach((r) => r.id && next.add(r.id));
    setSelectedIds(next);
  };

  const toggleRow = (id?: number) => {
    if (!id) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const publishSelected = async () => {
    if (selectedIds.size === 0) return;
    setShowLoader(true);
    try {
      // No bulk endpoint found; publish sequentially
      for (const id of Array.from(selectedIds)) {
        await publishRfpAsync(id);
      }
      setSelectedIds(new Set());
      await load();
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <div className="admin-page">
      {showLoader && <PageLoader />}
      <div className="admin-content">
        <div className="admin-page-header mb-6">
        <div className="admin-page-header-row">
          <div>
            <h1 className="text-heading-2">Approved RFPs</h1>
            <p className="text-body-small text-subtle">Select approved RFPs and publish them.</p>
          </div>
          <div className="admin-title-actions">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <div className="min-w-64">
                <Select
                  allowClear
                  showSearch
                  placeholder="All categories"
                  value={selectedCategoryId as any}
                  onChange={(v) => onCategoryChange((v as number) ?? null)}
                  optionFilterProp="label"
                  loading={categoriesLoading}
                  filterOption={(input, option) => {
                    const label = (option?.label as string) || "";
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  options={(categories || []).map((c: any) => ({ label: c.name, value: c.id, description: c.description }))}
                  // Render dropdown in body to avoid clipping by overflow containers
                  getPopupContainer={() => document.body}
                  // Nicer dropdown UI
                  dropdownStyle={{ padding: 8, borderRadius: 12 }}
                  optionRender={(option) => (
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-violet-50 text-violet-700 text-xs font-bold">{String(option.data.label).charAt(0).toUpperCase()}</span>
                      <div className="leading-tight">
                        <div className="text-sm font-medium text-gray-900">{option.data.label}</div>
                        {option.data.description && (
                          <div className="text-xs text-gray-500">{option.data.description}</div>
                        )}
                      </div>
                    </div>
                  )}
                  style={{ width: 260 }}
                />
              </div>
            </div>
            <button
              className="app-button-secondary"
              onClick={toggleSelectAll}
            >{allSelected ? "Clear Selection" : "Select All"}</button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ${selectedIds.size ? "bg-violet-700 hover:bg-violet-800 shadow-[0_10px_22px_rgba(109,40,217,0.22)]" : "bg-slate-400 cursor-not-allowed"}`}
              disabled={selectedIds.size === 0}
              onClick={publishSelected}
            >Publish Now ({selectedIds.size})</button>
          </div>
        </div>
        </div>

        {/* Inline table with selection checkboxes */}
        <div className="admin-panel">
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full min-w-[1024px] border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  {columns.map((c: ColumnKey) => (
                    <th key={c} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      {rfp_column_labels[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-violet-50/60 transition-colors duration-150">
                    <td className="px-5 py-4 text-sm">
                      <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleRow(item.id)} />
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-5 py-4 text-sm text-slate-800">
                        {col === "status" ? rfpStatuses.find((s) => s.value === item.status)?.label : item[col]}
                      </td>
                    ))}
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-6 py-14 text-center text-sm text-slate-500" colSpan={columns.length + 1}>No approved RFPs</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


