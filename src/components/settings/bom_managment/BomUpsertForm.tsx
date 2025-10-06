import React, { useState } from 'react';
import { notification } from 'antd';
import { IModalProps } from '../../../types/commonTypes';
import { IBom, IBomItem } from '../../../types/bomTypes';
import { createBomAsync, updateBomAsync } from '../../../services/bomService';

interface IBomUpsertFormProps extends IModalProps {
  type?: 'create' | 'edit';
  bom: IBom;
  trigger: () => void;
}

const emptyItem: IBomItem = {
  itemCode: '',
  itemName: '',
  quantity: 1,
  unit: 'Each',
  unitPrice: 0,
  description: '',
  supplier: '',
};

const BomUpsertForm: React.FC<IBomUpsertFormProps> = ({ type = 'create', bom, trigger, closeModal }) => {
  const [formData, setFormData] = useState<IBom>(type === 'create' ? { name: '', description: '', items: [] } : bom);
  const [currentItem, setCurrentItem] = useState<IBomItem>(emptyItem);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = () => {
    if (!currentItem.itemCode || !currentItem.itemName) {
      notification.error({ message: 'Item code and name are required' });
      return;
    }
    setFormData(prev => ({ ...prev, items: [...prev.items, { ...currentItem, id: Date.now().toString() }] }));
    setCurrentItem(emptyItem);
  };

  const removeItem = (id?: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notification.error({ message: 'BOM name is required' });
      return;
    }
    if (formData.items.length === 0) {
      notification.error({ message: 'Add at least one item' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        items: formData.items.map(({ id, ...rest }) => rest),
      };
      if (type === 'edit' && formData.id) {
        await updateBomAsync(formData.id, { id: formData.id, ...payload });
        notification.success({ message: 'BOM updated successfully' });
      } else {
        await createBomAsync(payload);
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

  const total = formData.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600">BOM Name *</label>
          <input className="w-full border rounded px-3 py-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-600">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div className="mt-4 border rounded p-3">
          <h3 className="font-semibold mb-2">Add Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input placeholder="Item Code *" className="border rounded px-3 py-2" value={currentItem.itemCode} onChange={e => setCurrentItem({ ...currentItem, itemCode: e.target.value })} />
            <input placeholder="Item Name *" className="border rounded px-3 py-2" value={currentItem.itemName} onChange={e => setCurrentItem({ ...currentItem, itemName: e.target.value })} />
            <input placeholder="Quantity" type="number" className="border rounded px-3 py-2" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })} />
            <input placeholder="Unit" className="border rounded px-3 py-2" value={currentItem.unit} onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })} />
            <input placeholder="Unit Price" type="number" className="border rounded px-3 py-2" value={currentItem.unitPrice} onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })} />
            <input placeholder="Supplier" className="border rounded px-3 py-2" value={currentItem.supplier || ''} onChange={e => setCurrentItem({ ...currentItem, supplier: e.target.value })} />
            <input placeholder="Description" className="border rounded px-3 py-2 col-span-2" value={currentItem.description || ''} onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })} />
          </div>
          <div className="mt-3">
            <button type="button" className="px-3 py-2 bg-[#7C3AED] text-white rounded" onClick={addItem}>+ Add Item</button>
          </div>

          <div className="mt-4 max-h-48 overflow-auto">
            {formData.items.map(it => (
              <div key={it.id} className="grid grid-cols-6 gap-2 items-center border-b py-2 text-sm">
                <div className="col-span-2">{it.itemCode} - {it.itemName}</div>
                <div>{it.quantity} {it.unit}</div>
                <div>{it.unitPrice}</div>
                <div className="text-right">{(it.quantity * it.unitPrice).toFixed(2)}</div>
                <button type="button" className="text-red-600" onClick={() => removeItem(it.id)}>Remove</button>
              </div>
            ))}
            {formData.items.length === 0 && <div className="text-xs text-gray-500">No items added yet.</div>}
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
