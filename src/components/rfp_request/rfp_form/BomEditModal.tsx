import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { IBomItem } from '../../../types/bomTypes';
import { commonUnits } from '../../../utils/constants';

interface BomEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (editedBom: any) => void; // create as new BOM
  onSaveLocal?: (editedBom: any) => void; // save changes locally only
  bom: any;
}

const BomEditModal: React.FC<BomEditModalProps> = ({ open, onClose, onSave, onSaveLocal, bom }) => {
  const [formData, setFormData] = useState({
    bomName: '',
    description: '',
    categoryId: undefined as number | undefined,
  });
  const [items, setItems] = useState<IBomItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<IBomItem>>({
    itemCode: '',
    itemName: '',
    quantity: 0,
    unit: 1, // Default to 'Piece'
    price: 0,
    description: '',
    supplier: ''
  });

  useEffect(() => {
    if (bom && open) {
      setFormData({
        bomName: bom.bomName || '',
        description: bom.description || '',
        categoryId: bom.categoryId
      });
      setItems(bom.bomItemDtos || []);
    }
  }, [bom, open]);

  const buildEditedBom = () => {
    if (!formData.bomName.trim()) {
      message.error('Please enter product list name');
      return;
    }

    if (items.length === 0) {
      message.error('Please add at least one product');
      return;
    }

    const editedBom = {
      ...bom,
      bomName: formData.bomName,
      description: formData.description,
      categoryId: formData.categoryId,
      bomItemDtos: items
    };
    return editedBom;
  };

  const handleSaveLocal = () => {
    const editedBom = buildEditedBom();
    if (!editedBom) return;
    if (onSaveLocal) {
      onSaveLocal(editedBom);
    }
  };

  const hasChanges = () => {
    if (!bom) return false;
    if ((bom.bomName || '') !== formData.bomName) return true;
    if ((bom.description || '') !== (formData.description || '')) return true;
    if ((bom.categoryId ?? undefined) !== (formData.categoryId ?? undefined)) return true;

    const originalItems = Array.isArray(bom.bomItemDtos) ? bom.bomItemDtos : [];
    if (originalItems.length !== items.length) return true;

    for (let i = 0; i < items.length; i++) {
      const a: any = items[i];
      const b: any = originalItems[i] || {};
      if ((a.itemCode || '') !== (b.itemCode || '')) return true;
      if ((a.itemName || '') !== (b.itemName || '')) return true;
      if (Number(a.quantity || 0) !== Number(b.quantity || 0)) return true;
      if (Number(a.unit || 0) !== Number(b.unit || 0)) return true;
      if (Number(a.price || 0) !== Number(b.price || 0)) return true;
      if ((a.description || '') !== (b.description || '')) return true;
      if ((a.supplier || '') !== (b.supplier || '')) return true;
    }

    return false;
  };

  const handleCreateAsNew = () => {
    if (!hasChanges()) {
      message.info('No changes detected to create a new product list.');
      return;
    }
    const editedBom = buildEditedBom();
    if (!editedBom) return;
    onSave(editedBom);
  };

  const handleAddItem = () => {
    if (!newItem.itemName?.trim()) {
      message.error('Please enter medicine or supply name');
      return;
    }

    const item: IBomItem = {
      itemCode: newItem.itemCode || '',
      itemName: newItem.itemName || '',
      quantity: newItem.quantity || 0,
      unit: newItem.unit || 1,
      price: newItem.price || 0,
      description: newItem.description || '',
      supplier: newItem.supplier || ''
    };

    setItems([...items, item]);
    setNewItem({
      itemCode: '',
      itemName: '',
      quantity: 0,
      unit: 1,
      price: 0,
      description: '',
      supplier: ''
    });
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    setNewItem(items[index]);
  };

  const handleUpdateItem = () => {
    if (!newItem.itemName?.trim()) {
      message.error('Please enter medicine or supply name');
      return;
    }

    const updatedItems = items.map((item, index) => 
      index === editingItemIndex ? {
        ...item,
        itemCode: newItem.itemCode || '',
        itemName: newItem.itemName || '',
        quantity: newItem.quantity || 0,
        unit: newItem.unit || 1,
        price: newItem.price || 0,
        description: newItem.description || '',
        supplier: newItem.supplier || ''
      } : item
    );

    setItems(updatedItems);
    setEditingItemIndex(null);
    setNewItem({
      itemCode: '',
      itemName: '',
      quantity: 0,
      unit: 1,
      price: 0,
      description: '',
      supplier: ''
    });
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setEditingItemIndex(null);
    setNewItem({
      itemCode: '',
      itemName: '',
      quantity: 0,
      unit: 1,
      price: 0,
      description: '',
      supplier: ''
    });
  };

  const getUnitLabel = (unitValue: string) => {
    const unit = commonUnits.find((u) => u.value.toString() === unitValue);
    return unit ? unit.label : unitValue;
  };

  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity || 0) * (item.price || 0), 0);
  };

  return (
    <Modal
      title="Edit Product List"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <button
          key="cancel"
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>,
        <button
          key="save-local"
          type="button"
          onClick={handleSaveLocal}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>,
        <button
          key="create-new"
          type="button"
          onClick={handleCreateAsNew}
          disabled={!hasChanges()}
          className={`ml-2 px-4 py-2 text-white rounded-md ${hasChanges() ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 opacity-50 cursor-not-allowed'}`}
        >
          Create as new Product List
        </button>
      ]}
    >
      <div className="space-y-6">
        {/* Product List Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product List Name *
            </label>
            <input
              type="text"
              value={formData.bomName}
              onChange={(e) => setFormData({ ...formData, bomName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product list name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Products</h3>
            <span className="text-sm text-gray-500">
              Total: {fmt(calculateTotal())}
            </span>
          </div>

          {/* Products List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-6 gap-2 text-sm">
                  <div className="font-medium">{item.itemCode || 'N/A'}</div>
                  <div className="col-span-2">{item.itemName}</div>
                  <div>{item.quantity} {getUnitLabel(item.unit?.toString())}</div>
                  <div className="text-right">{fmt(item.price)}</div>
                  <div className="text-right font-medium">{fmt(item.quantity * item.price)}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditItem(index)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Product Form */}
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-blue-50">
            <h4 className="font-medium text-gray-800 mb-3">
              {editingItemIndex !== null ? 'Edit Product' : 'Add New Product'}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code
                </label>
                <input
                  type="text"
                  value={newItem.itemCode || ''}
                  onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product code"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine/Supply Name *
                </label>
                <input
                  type="text"
                  value={newItem.itemName || ''}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter medicine or supply name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={newItem.unit || '1'}
                  onChange={(e) => setNewItem({ ...newItem, unit: Number(e.target.value ?? "0") })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {commonUnits.map((unit) => (
                    <option key={unit.value} value={unit.value.toString()}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price
                </label>
                <input
                  type="number"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={newItem.supplier || ''}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier"
                />
              </div> */}
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter product description"
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              {editingItemIndex !== null ? (
                <>
                  <button
                    type="button"
                    onClick={handleUpdateItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Product
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <PlusOutlined />
                  Add Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BomEditModal;
