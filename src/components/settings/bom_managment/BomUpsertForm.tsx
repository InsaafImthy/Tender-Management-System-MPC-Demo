import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { IModalProps } from '../../../types/commonTypes';
import { IBom, IBomItem } from '../../../types/bomTypes';
import { createBomAsync, updateBomAsync } from '../../../services/bomService';
import { getAllCategoriesAsync } from '../../../services/categoryService';
import { commonUnits } from '../../../utils/constants';

interface IBomUpsertFormProps extends IModalProps {
  type?: 'create' | 'edit';
  bom: IBom;
  trigger: () => void;
}

const emptyItem: IBomItem = {
  itemCode: '',
  itemName: '',
  quantity: 1,
  // backend expects numeric unit (enum/int)
  // default to 0
  unit: 0 as unknown as any,
  price: 0,
  description: '',
  supplier: '',
};

const BomUpsertForm: React.FC<IBomUpsertFormProps> = ({ type = 'create', bom, trigger, closeModal }) => {
  const [formData, setFormData] = useState<IBom>(type === 'create' ? { bomName: '', description: '', bomItemDtos: [] } as IBom : bom);
  const [currentItem, setCurrentItem] = useState<IBomItem>(emptyItem);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getAllCategoriesAsync({ fields: [], pageNo: 0, pageSize: 0 });
        setCategories(Array.isArray(list) ? list : []);
      } catch {}
    })();
  }, []);

  const addItem = () => {
    if (!currentItem.itemCode || !currentItem.itemName) {
      notification.error({ message: 'Item code and name are required' });
      return;
    }
    setFormData(prev => ({ ...prev, bomItemDtos: [...(prev.bomItemDtos || []), { ...currentItem, id:0 }] }));
    setCurrentItem(emptyItem);
  };

  const removeItem = (id?: string) => {
    setFormData(prev => ({ ...prev, bomItemDtos: (prev.bomItemDtos || []).filter(i => i.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(formData.bomName || '').toString().trim()) {
      notification.error({ message: 'BOM name is required' });
      return;
    }
    if (!formData.categoryId) {
      notification.error({ message: 'Category is required' });
      return;
    }
    if (!formData.bomItemDtos || formData.bomItemDtos.length === 0) {
      notification.error({ message: 'Add at least one item' });
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        id: formData.id,
        bomName: formData.bomName,
        description: formData.description,
        categoryId: formData.categoryId,
        bomItemDtos: (formData.bomItemDtos || []).map(({ id, ...rest }) => rest),
      };
      if (type === 'edit' && formData.id) {
        await updateBomAsync(formData.id, payload);
        notification.success({ message: 'BOM updated successfully' });
      } else {
        const { id, ...createPayload } = payload;
        await createBomAsync(createPayload);
        notification.success({ message: 'BOM created successfully' });
      }
      closeModal();
      trigger();
    } catch (err: any) {
      notification.error({ message: err?.message || 'Failed to save BOM' });
    } finally {
      setIsLoading(false);
    }
  };

  const total = (formData.bomItemDtos || []).reduce((sum, i: any) => sum + Number(i.quantity || 0) * Number(i.price || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600">BOM Name *</label>
          <input className="w-full border rounded px-3 py-2" value={formData.bomName || ''} onChange={e => setFormData({ ...formData, bomName: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-600">Category *</label>
          <select
            className="w-full border rounded px-3 py-2 bg-white"
            value={formData.categoryId ?? ''}
            onChange={e => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Select category</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="mt-4 border rounded p-3">
          <h3 className="font-semibold mb-2">Add Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Item Code *</label>
              <input className="w-full border rounded px-3 py-2" value={currentItem.itemCode} onChange={e => setCurrentItem({ ...currentItem, itemCode: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Item Name *</label>
              <input className="w-full border rounded px-3 py-2" value={currentItem.itemName} onChange={e => setCurrentItem({ ...currentItem, itemName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Quantity</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Units of Measure</label>
              <select
                className="w-full border rounded px-3 py-2 bg-white"
                value={Number(currentItem.unit as any) || 0}
                onChange={e => setCurrentItem({ ...currentItem, unit: Number(e.target.value) as unknown as any })}
              >
                {commonUnits.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Expected Price</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={currentItem.price} onChange={e => setCurrentItem({ ...currentItem, price: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-3 col-span-2">
              <label className="text-xs text-gray-600">Item Description</label>
              <input className="w-full border rounded px-3 py-2" value={currentItem.description || ''} onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <button type="button" className="px-3 py-2 bg-[#7C3AED] text-white rounded" onClick={addItem}>+ Add Item</button>
          </div>

          <div className="mt-4 max-h-48 overflow-auto">
            {(formData.bomItemDtos || []).map((it: any) => (
              <div key={it.id} className="grid grid-cols-6 gap-2 items-center border-b py-2 text-sm">
                <div className="col-span-2">{it.itemCode} - {it.itemName}</div>
                <div>{it.quantity} {it.unit}</div>
                <div>{it.price}</div>
                <div className="text-right">{(Number(it.quantity || 0) * Number(it.price || 0)).toFixed(2)}</div>
                <button type="button" className="text-red-600" onClick={() => removeItem(it.id)}>Remove</button>
              </div>
            ))}
            {(!formData.bomItemDtos || formData.bomItemDtos.length === 0) && <div className="text-xs text-gray-500">No items added yet.</div>}
          </div>

          <div className="mt-3 text-right font-semibold">Total: ${total.toFixed(2)}</div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 border rounded" onClick={closeModal}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[#7C3AED] text-white rounded" disabled={isLoading}>{isLoading ? 'Saving...' : type === 'edit' ? 'Update BOM' : 'Save BOM'}</button>
        </div>
      </div>
    </form>
  );
};

export default BomUpsertForm;
