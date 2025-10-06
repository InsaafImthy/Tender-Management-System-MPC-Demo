import React, { useEffect, useMemo, useState } from 'react';
import { Modal as AntdModal } from 'antd';
import { getAllBomsAsync } from '../../../services/bomService';
import { getAllCategoriesAsync } from '../../../services/categoryService';
import { IBom } from '../../../types/bomTypes';
import { IFilterDto } from '../../../types/commonTypes';
import { defaultFilter } from '../../../utils/constants';
import { commonUnits } from '../../../utils/constants';
import { useNavigate } from 'react-router-dom';

interface BomSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (bom: IBom) => void;
}

const BomSelectModal: React.FC<BomSelectModalProps> = ({ open, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [boms, setBoms] = useState<IBom[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string | number, boolean>>({});
  const navigate = useNavigate();

  const load = async (filter: IFilterDto) => {
    try {
      setLoading(true);
      const res = await getAllBomsAsync(filter);
      setBoms(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const cats = await getAllCategoriesAsync({ fields: [], pageNo: 0, pageSize: 0 });
      setCategories(Array.isArray(cats) ? cats : []);
    })();
  }, []);

  useEffect(() => {
    if (!open) return;
    load({ ...defaultFilter, globalSearch: search });
  }, [open, search]);

  const filtered = useMemo(() => {
    if (!categoryId) return boms;
    return boms.filter((b) => (b.categoryId === Number(categoryId)) || (b.category && b.category.id === Number(categoryId)));
  }, [boms, categoryId]);

  const calcValue = (bom: IBom) => {
    const items = (bom as any).bomItemDtos || [];
    return items.reduce((s: number, it: any) => s + Number(it.quantity || 0) * Number(it.price || 0), 0);
  };

  const getUnitLabel = (unitValue: number) => {
    const unit = commonUnits.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;
  const fmtDate = (d?: string) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString();
    } catch { return d; }
  };

  return (
    <AntdModal
      title={
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[20px] font-semibold">Select Bill of Materials</div>
            <div className="text-xs text-gray-500">Choose an existing BOM or create a new one</div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <input
            placeholder="Search BOMs by name or description..."
            className="w-full border rounded px-3 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-60">
          <select
            className="w-full border rounded px-3 py-2 bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="px-3 py-2 bg-[#7C3AED] text-white rounded" onClick={() => navigate('/settings/bom-managment')}>+ Create New BOM</button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {!loading && filtered.map((bom) => {
          const items = (bom as any).bomItemDtos || [];
          const isOpen = expandedIds[bom.id as any];
          return (
            <div key={bom.id} className="border rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${isOpen ? 'bg-[#7C3AED] text-white' : 'text-gray-600'}`}
                      onClick={() => setExpandedIds(prev => ({ ...prev, [bom.id as any]: !prev[bom.id as any] }))}
                    >
                      {isOpen ? '▾' : '▸'}
                    </button>
                    <div className="text-[16px] font-semibold">{(bom as any).bomName || ''}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{(bom as any).description || ''}</div>
                  <div className="text-xs text-gray-500 mt-2 flex gap-6">
                    <span>Items: {items.length}</span>
                    <span>Value: {fmt(calcValue(bom))}</span>
                    {bom.createdAt && <span>Created: {fmtDate((bom as any).createdAt)}</span>}
                  </div>
                </div>
                <button className="px-3 py-2 bg-[#7C3AED] text-white rounded self-start" onClick={() => onSelect(bom)}>SELECT BOM</button>
              </div>

              {isOpen && items.length > 0 && (
                <div className="mt-4 border-t pt-3 space-y-2">
                  {items.map((it: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center text-sm bg-gray-50 rounded px-3 py-2">
                      <div className="col-span-2 text-gray-600">{it.itemCode}</div>
                      <div className="col-span-6">{it.itemName}</div>
                      <div className="col-span-2 text-gray-600">{Number(it.quantity)} {getUnitLabel(Number(it.unit))}</div>
                      <div className="col-span-2 text-right font-medium">{fmt(Number(it.price))}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-gray-500">No BOMs found</div>
        )}
      </div>
      <div className="mt-3 text-xs text-gray-500">{filtered.length} BOMs found</div>
    </AntdModal>
  );
};

export default BomSelectModal;
