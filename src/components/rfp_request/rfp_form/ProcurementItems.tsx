import React, { useState } from "react";
import { message } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { IProcurementItem } from "../../../types/rfpTypes";
import { parseExcelFile, validateParsedItems } from "../../../utils/excelParser";
import { BoxIcon } from "../../../utils/Icons";
import BomSelectModal from "./BomSelectModal";
import { commonUnits } from "../../../utils/constants";

interface ProcurementItemsProps {
  items?: IProcurementItem[];
  setItems: React.Dispatch<React.SetStateAction<IProcurementItem[]>>;
}

const ProcurementItems: React.FC<ProcurementItemsProps> = ({ items = [], setItems }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<IProcurementItem>({ itemName: "", itemCode: "", quantity: 0 });
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [selectedBoms, setSelectedBoms] = useState<any[]>([]);
  const [mode, setMode] = useState<"items" | "bom">("items");
  const [expandedBomIds, setExpandedBomIds] = useState<Record<string | number, boolean>>({});

  const getUnitLabel = (unitValue: number) => {
    const unit = commonUnits.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;

  const handleAddItem = () => {
    if (!editForm.itemName.trim()) {
      return;
    }

    setItems([...items, { ...editForm, id: 0 }]);
    setEditForm({ itemName: "", itemCode: "", quantity: 0 });
  };

  const handleEditItem = (index: number) => {
    setEditForm(items[index]);
    setEditingIndex(index);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSaveItem = () => {
    if (!editForm.itemName.trim()) {
      return;
    }

    // Editing existing item
    const updatedItems = items.map((item, index) =>
      index === editingIndex ? { ...editForm, id: item.id || 0 } : item
    );
    setItems(updatedItems);

    setEditingIndex(null);
    setEditForm({ itemName: "", itemCode: "", quantity: 0 });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ itemName: "", itemCode: "", quantity: 0 });
  };

  const calculateTotal = () => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      message.error('Please upload a CSV or Excel file (.csv, .xls, .xlsx)');
      return;
    }

    // Show confirmation if there are existing items
    if ((items || []).length > 0) {
      const confirmed = window.confirm(
        `This will replace all ${(items || []).length} existing items with the items from the uploaded file. Are you sure you want to continue?`
      );
      if (!confirmed) {
        event.target.value = '';
        return;
      }
    }

    try {
      const parsedItems = await parseExcelFile(file);
      const validation = validateParsedItems(parsedItems);

      if (!validation.valid) {
        message.error(`File validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // Convert parsed items to IProcurementItem format
      const newItems: IProcurementItem[] = parsedItems.map((item) => ({
        id: 0,
        itemName: item.itemName,
        itemCode: item.itemCode,
        quantity: item.quantity
      }));

      // Replace existing items with imported items
      setItems(newItems);
      message.success(`Successfully imported ${newItems.length} items from ${file.name}. Previous items have been replaced.`);

      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error parsing file:', error);
      message.error('Failed to parse the uploaded file. Please check the format.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Procurement Items</h2>
            <p className="text-gray-600 mt-1">Add procurement items with their quantities for this RFP</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Mode Switch */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode("items")}
            className={`px-4 py-2 rounded border ${mode === "items" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-gray-700 border-gray-300"}`}
          >
            Add Items
          </button>
          <button
            type="button"
            onClick={() => setMode("bom")}
            className={`px-4 py-2 rounded border ${mode === "bom" ? "bg-[#7C3AED] text-white border-[#7C3AED]" : "bg-white text-gray-700 border-gray-300"}`}
          >
            Add BOM
          </button>
        </div>
        {/* Excel Upload Section */}
        {mode === "items" && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Bulk Import Items</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload a CSV or Excel file with columns: Item Name, Item Code, Quantity
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="excel-upload"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <label
                  htmlFor="excel-upload"
                  className="flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 border-0 rounded-lg hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <UploadOutlined className="mr-2 text-lg" />
                  Upload File
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        {mode === "items" && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                  {(items || []).length} item{(items || []).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Item Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(items || []).map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {item.itemCode || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {item.quantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              handleEditItem(index)
                              e.preventDefault();
                            }
                            }
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Edit item"
                          >
                            <EditOutlined className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Delete item"
                          >
                            <DeleteOutlined className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Add/Edit Row */}
                  {editingIndex !== null && (
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400">
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.itemName}
                          onChange={(e) =>
                            setEditForm({ ...editForm, itemName: e.target.value })
                          }
                          placeholder="Enter item name"
                          className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          autoFocus
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.itemCode}
                          onChange={(e) =>
                            setEditForm({ ...editForm, itemCode: e.target.value })
                          }
                          placeholder="Enter item code"
                          className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          min="0"
                          step="1"
                          className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={handleSaveItem}
                            className="inline-flex items-center justify-center w-10 h-10 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Save item"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center justify-center w-10 h-10 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Add New Item Row - Always visible when not editing */}
                  {editingIndex === null && (
                    <tr className="hover:bg-gray-50 border-t-2 border-dashed border-gray-300 bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editForm.itemName}
                            onChange={(e) =>
                              setEditForm({ ...editForm, itemName: e.target.value })
                            }
                            placeholder="Enter item name"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.itemCode}
                          onChange={(e) =>
                            setEditForm({ ...editForm, itemCode: e.target.value })
                          }
                          placeholder="Enter item code"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          min="0"
                          step="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={handleAddItem}
                            disabled={!editForm.itemName.trim()}
                            className="inline-flex items-center justify-center w-10 h-10 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Add item"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setEditForm({ itemName: "", itemCode: "", quantity: 0 })}
                            className="inline-flex items-center justify-center w-10 h-10 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Clear form"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOM Section */}
        {mode === "bom" && (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Bill of Materials</h3>
              <button
                type="button"
                className="px-3 py-2 bg-[#7C3AED] text-white rounded"
                onClick={() => setBomModalOpen(true)}
              >
                + Add BOM
              </button>
            </div>
            <div className="p-6">
              {(selectedBoms || []).length === 0 && (
                <div className="text-sm text-gray-500">No BOMs added.</div>
              )}
              {(selectedBoms || []).map((b: any) => {
                const items = b?.bomItemDtos || [];
                const isOpen = expandedBomIds[b.id as any];
                const total = items.reduce((s: number, it: any) => s + Number(it.quantity || 0) * Number(it.price || 0), 0);
                return (
                  <div key={b.id} className="border rounded-xl p-4 mb-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${isOpen ? 'bg-[#7C3AED] text-white' : 'text-gray-600'}`}
                            onClick={() => setExpandedBomIds(prev => ({ ...prev, [b.id as any]: !prev[b.id as any] }))}
                          >
                            {isOpen ? '▾' : '▸'}
                          </button>
                          <div className="font-semibold text-[16px]">{b.bomName}</div>
                        </div>
                        {b.description && <div className="text-xs text-gray-600 mt-2">{b.description}</div>}
                        <div className="text-xs text-gray-500 mt-2 flex gap-6">
                          <span>Items: {items.length}</span>
                          <span>Value: {fmt(total)}</span>
                          {b.category && <span>Category: {b.category?.name}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 text-sm"
                        onClick={() => setSelectedBoms(prev => prev.filter(x => x.id !== b.id))}
                      >
                        Remove
                      </button>
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
            </div>
          </div>
        )}

        {/* Total Quantity */}
        {mode === "items" && (items || []).length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg"><BoxIcon /></span>
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  Total Quantity
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-800 bg-white px-4 py-2 rounded-lg shadow-sm">
                {calculateTotal().toLocaleString()} items
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {mode === "items" && (items || []).length === 0 && editingIndex === null && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No items added yet</h3>
            <p className="text-gray-500 mb-4">Use the form below to add items or upload an Excel file</p>
          </div>
        )}
      </div>
      <BomSelectModal
        open={bomModalOpen}
        onClose={() => {
          setBomModalOpen(false)
        }}
        onSelect={(bom) => {
          setSelectedBoms((prev) => [...prev, bom]);
          setBomModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProcurementItems;
