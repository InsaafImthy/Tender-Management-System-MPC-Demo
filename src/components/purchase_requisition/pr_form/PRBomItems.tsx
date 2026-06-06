import React, { useState } from "react";
import { message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BomSelectModal from "../../rfp_request/rfp_form/BomSelectModal";
import { commonUnits } from "../../../utils/constants";
import { BoxIcon } from "../../../utils/Icons";

interface PRBomItemsProps {
  selectedBoms: any[];
  setSelectedBoms: React.Dispatch<React.SetStateAction<any[]>>;
}

const PRBomItems: React.FC<PRBomItemsProps> = ({
  selectedBoms,
  setSelectedBoms,
}) => {
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [expandedBomIds, setExpandedBomIds] = useState<Record<string | number, boolean>>({});
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const getUnitLabel = (unitValue: number) => {
    const unit = commonUnits.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;

  const handleEditQuantity = (bomId: number, itemIndex: number) => {
    const key = `${bomId}-${itemIndex}`;
    const bom = selectedBoms.find((b) => b.id === bomId);
    if (bom && bom.bomItemDtos[itemIndex]) {
      setEditingItemKey(key);
      setEditQuantity(bom.bomItemDtos[itemIndex].quantity);
    }
  };

  const handleSaveQuantity = (bomId: number, itemIndex: number) => {
    if (editQuantity <= 0) {
      message.error("Quantity must be greater than 0");
      return;
    }

    setSelectedBoms((prev) =>
      prev.map((bom) => {
        if (bom.id === bomId) {
          const updatedItems = [...bom.bomItemDtos];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: editQuantity,
          };
          return { ...bom, bomItemDtos: updatedItems };
        }
        return bom;
      })
    );

    setEditingItemKey(null);
    setEditQuantity(0);
    message.success("Quantity updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingItemKey(null);
    setEditQuantity(0);
  };

  const handleDeleteItem = (bomId: number, itemIndex: number) => {
    setSelectedBoms((prev) =>
      prev.map((bom) => {
        if (bom.id === bomId) {
          const updatedItems = bom.bomItemDtos.filter(
            (_: any, idx: number) => idx !== itemIndex
          );
          return { ...bom, bomItemDtos: updatedItems };
        }
        return bom;
      }).filter((bom) => bom.bomItemDtos.length > 0) // Remove product list if no items left
    );
    message.success("Product deleted successfully");
  };

  const calculateBomTotal = (items: any[]) => {
    return items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    return selectedBoms.reduce((total, bom) => {
      return total + calculateBomTotal(bom.bomItemDtos || []);
    }, 0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Selection
            </h2>
            <p className="text-gray-600 mt-1">
              Select product lists and specify quantities for requisition
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Selected Products
            </h3>
            <button
              type="button"
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-all duration-200 shadow-md"
              onClick={() => setBomModalOpen(true)}
            >
              + Add
            </button>
          </div>

          <div className="p-6">
            {(selectedBoms || []).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BoxIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No product lists added yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Click "Add" to select medicines and medical supplies for this requisition
                </p>
              </div>
            )}

            {(selectedBoms || []).map((bom: any) => {
              const items = bom?.bomItemDtos || [];
              const isOpen = expandedBomIds[bom.id];
              const total = calculateBomTotal(items);

              return (
                <div
                  key={bom.id}
                  className="border rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
                            isOpen
                              ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                              : "text-gray-600 border-gray-300 hover:border-[#7C3AED]"
                          }`}
                          onClick={() =>
                            setExpandedBomIds((prev) => ({
                              ...prev,
                              [bom.id]: !prev[bom.id],
                            }))
                          }
                        >
                          {isOpen ? "▾" : "▸"}
                        </button>
                        <div>
                          <div className="font-semibold text-[16px]">
                            {bom.bomName}
                          </div>
                          {bom.description && (
                            <div className="text-xs text-gray-600 mt-1">
                              {bom.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-3 flex gap-6 ml-11">
                        <span className="flex items-center">
                          <span className="font-semibold mr-1">Products:</span>
                          {items.length}
                        </span>
                        <span className="flex items-center">
                          <span className="font-semibold mr-1">
                            Total Value:
                          </span>
                          {fmt(total)}
                        </span>
                        {bom.category && (
                          <span className="flex items-center">
                            <span className="font-semibold mr-1">
                              Category:
                            </span>
                            {bom.category?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 text-sm hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-all duration-200"
                      onClick={() =>
                        setSelectedBoms((prev) =>
                          prev.filter((x) => x.id !== bom.id)
                        )
                      }
                    >
                      Remove Product List
                    </button>
                  </div>

                  {isOpen && items.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Product Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Medicine/Supply Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                UOM
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Requested Quantity
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                Estimated Cost
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item: any, idx: number) => {
                              const key = `${bom.id}-${idx}`;
                              const isEditing = editingItemKey === key;

                              return (
                                <tr
                                  key={idx}
                                  className="hover:bg-blue-50 transition-colors duration-150"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.itemCode}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.itemName}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {getUnitLabel(Number(item.unit))}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {isEditing ? (
                                      <input
                                        type="number"
                                        value={editQuantity}
                                        onChange={(e) =>
                                          setEditQuantity(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="w-24 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        step="0.01"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                        {Number(item.quantity).toLocaleString()}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-medium">
                                    {fmt(Number(item.price))}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      {isEditing ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSaveQuantity(bom.id, idx)
                                            }
                                            className="inline-flex items-center justify-center w-8 h-8 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200"
                                            title="Save"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="inline-flex items-center justify-center w-8 h-8 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-all duration-200"
                                            title="Cancel"
                                          >
                                            ✕
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleEditQuantity(bom.id, idx)
                                            }
                                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                            title="Edit quantity"
                                          >
                                            <EditOutlined className="text-sm" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteItem(bom.id, idx)
                                            }
                                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                                            title="Delete product"
                                          >
                                            <DeleteOutlined className="text-sm" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grand Total */}
        {(selectedBoms || []).length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">
                    <BoxIcon />
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  Total Estimated Cost
                </span>
              </div>
              <span className="text-2xl font-bold text-green-800 bg-white px-6 py-2 rounded-lg shadow-sm">
                {fmt(calculateGrandTotal())}
              </span>
            </div>
          </div>
        )}
      </div>

      <BomSelectModal
        open={bomModalOpen}
        onClose={() => setBomModalOpen(false)}
        onSelect={(bom) => {
          // Check if product list already exists
          const exists = selectedBoms.some((b) => b.id === bom.id);
          if (exists) {
            message.warning("This product list has already been added");
            return;
          }
          setSelectedBoms((prev) => [...prev, bom]);
          setBomModalOpen(false);
          message.success("Product list added successfully");
        }}
      />
    </div>
  );
};

export default PRBomItems;

