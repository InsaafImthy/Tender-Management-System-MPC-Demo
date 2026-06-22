import React, { useEffect, useState } from "react";
import TextField from "../../components/basic_components/TextField";
import { DeliveryDetailsIconMain, EditIconMain } from "../../utils/Icons";
import DateTimePicker from "../../components/basic_components/date_time_picker/DateTimePicker";
import { message} from "antd";
import {
  parseExcelFileForDeliveryItems,
  validateParsedDeliveryItems,
} from "../../utils/excelParser";
import { IDeliveryItem } from "../../types/rfpTypes";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  createDeliveryDetails,
  getDeliveryDataByIDAsync,
} from "../../services/categoryService";

type DeliveryType = "create" | "edit";

interface DeliveryTypeFormProps {
  type?: DeliveryType;
}

const DeliveryPage: React.FC<DeliveryTypeFormProps> = ({ type = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [checklistItems, setchecklistItems] = useState<IDeliveryItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isIdavailable, setIsIdavailable] = useState(false);
  const [upload,] = useState<{ files: FileList | null }>({
    files: null,
  });

  const [editForm, setEditForm] = useState<IDeliveryItem>({
    itemName: "",
    itemCode: "",
    quantityOrdered: 0,
    quantityReceived: 0,
    unit: "",
    unitPrice: 0,
    totalPrice: 0,
    condition: 0,
    verify: false,
  });

  // Internal state for delivery info
  const [deliveryData, setDeliveryData] = useState({
    id: 0,
    poNumber: "",
    supplierName: "",
    deliveryLocation: "",
    deliveryDate: "",
    projectSite: "",
  });

  useEffect(() => {
    fetchdeliveryDatawithID();
  }, []);
  

  const fetchdeliveryDatawithID = async () => {
    if (id && !isNaN(Number(id))) {
      try {
        const fetchedData = await getDeliveryDataByIDAsync(Number(id));
        console.log("Data:", fetchedData);
        setDeliveryData(fetchedData);
        setchecklistItems(fetchedData.checklistItems);
        setIsIdavailable(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Excel upload handler remains the same
  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xls|xlsx)$/i)
    ) {
      message.error("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
      return;
    }

    if (checklistItems.length > 0) {
      const confirmed = window.confirm(
        `This will replace all ${checklistItems.length} existing products. Continue?`
      );
      if (!confirmed) {
        event.target.value = "";
        return;
      }
    }

    try {
      const parsedItems = await parseExcelFileForDeliveryItems(file);
      const validation = validateParsedDeliveryItems(parsedItems);

      if (!validation.valid) {
        message.error(
          `File validation failed: ${validation.errors.join(", ")}`
        );
        return;
      }

      const newItems: IDeliveryItem[] = parsedItems.map((item) => ({
        id: 0,
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
        unit: item.unit.toString(),
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        condition: item.condition,
        verify: item.verify,
      }));

      setchecklistItems(newItems);
      message.success(`Imported ${newItems.length} products successfully.`);
      event.target.value = "";
    } catch (error) {
      console.error("Error parsing file:", error);
      message.error(
        "Failed to parse the uploaded file. Please check the format."
      );
    }
  };

  // Add, edit, save, cancel, delete item handlers remain the same
  const handleAddItem = () => {
    if (!editForm.itemName.trim()) return;
    setchecklistItems([...checklistItems, { ...editForm }]);
    resetEditForm();
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditForm(checklistItems[index]);
  };

  const handleSaveItem = () => {
    if (editingIndex === null) return;
    const updatedItems = [...checklistItems];
    updatedItems[editingIndex] = editForm;
    setchecklistItems(updatedItems);
    setEditingIndex(null);
    resetEditForm();
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    resetEditForm();
  };

  const handleCancelform = () => {
    navigate("/delivery-details");
  };

  const handleDeleteItem = (index: number) => {
    const updated = [...checklistItems];
    updated.splice(index, 1);
    setchecklistItems(updated);
  };

  const resetEditForm = () => {
    setEditForm({
      itemName: "",
      itemCode: "",
      quantityOrdered: 0,
      quantityReceived: 0,
      unit: "",
      unitPrice: 0,
      totalPrice: 0,
      condition: 0,
      verify: false,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...deliveryData,
        uploadFiles: upload.files,
        checklistItems,
      };
      const response = await createDeliveryDetails(payload);

      if (response) {
        message.success("Delivery saved successfully");
        navigate("/delivery-details");
      } else {
        message.error("Error while saving delivery");
      }
    } catch (error) {
      message.error("Something went wrong");
      console.error(error);
    }
  };

  const handleEditclick = () => {
    setIsIdavailable(false);
  };

  const handleVerifyItem = (index: number) => {
    const updatedItems = [...checklistItems];
    updatedItems[index].verify = !updatedItems[index].verify;
    setchecklistItems(updatedItems);
  };

  return (
    <div className="admin-page">
      <div className="admin-content">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
        <div className="admin-title-cluster">
        <div className="admin-title-icon">
          <DeliveryDetailsIconMain />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Confirm Pharmacy Delivery</h1>
          <p className="text-sm text-slate-600">Record receipt of medicines and medical supplies</p>
        </div>
        </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="app-surface p-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-semibold text-slate-950">Delivery Information</h3>
          {isIdavailable && <EditIconMain onClick={handleEditclick} />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Delivery ID <span className="text-red-500">*</span>
            </label>
            <TextField
              required
              id="deliveryID"
              field="Delivery ID"
              value={deliveryData.id}
              setValue={(val: number) =>
                setDeliveryData({ ...deliveryData, id: val })
              }
              disabled={true}
              placeholder="Enter delivery ID"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              PO Number <span className="text-red-500">*</span>
            </label>
            <TextField
              required
              id="poNumber"
              field="PO Number"
              value={deliveryData.poNumber}
              setValue={(val: string) =>
                setDeliveryData({ ...deliveryData, poNumber: val })
              }
              disabled={isIdavailable}
              placeholder="Enter PO Number"
              type="text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <TextField
              required
              id="supplierName"
              field="Supplier Name"
              value={deliveryData.supplierName}
              setValue={(val: string) =>
                setDeliveryData({ ...deliveryData, supplierName: val })
              }
              disabled={isIdavailable}
              placeholder="Enter supplier name"
              type="text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Delivery Location <span className="text-red-500">*</span>
            </label>
            <TextField
              required
              id="deliveryLocation"
              field="Delivery Location"
              value={deliveryData.deliveryLocation}
              setValue={(val: string) =>
                setDeliveryData({ ...deliveryData, deliveryLocation: val })
              }
              disabled={isIdavailable}
              placeholder="Enter pharmacy or warehouse delivery location"
              type="text"
            />
          </div>
          <DateTimePicker
            required
            label="Delivery Date & Time"
            value={deliveryData.deliveryDate}
            setValue={(val: string) =>
              setDeliveryData({ ...deliveryData, deliveryDate: val })
            }
            disabled={isIdavailable}
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Pharmacy/Warehouse Location <span className="text-red-500">*</span>
            </label>
            <TextField
              required
              id="projectSite"
              field="Pharmacy/Warehouse Location"
              value={deliveryData.projectSite}
              setValue={(val: string) =>
                setDeliveryData({ ...deliveryData, projectSite: val })
              }
              disabled={isIdavailable}
              placeholder="Enter pharmacy or warehouse location"
              type="text"
            />
          </div>
        </div>
      </div>
      {/* Excel Upload */}
      {!isIdavailable && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-slate-950">Upload Product Items</h3>
          <input
            type="file"
            id="excel-upload"
            accept=".csv,.xls,.xlsx"
            onChange={handleExcelUpload}
            className="hidden"
          />
          <label
            htmlFor="excel-upload"
            className="app-button-primary cursor-pointer"
          >
            <UploadOutlined className="mr-2" />
            Upload File
          </label>
        </div>
      )}
      {/* Items Table */}
      <div className="admin-panel mt-6 mb-6 overflow-hidden p-0">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Product Code</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Medicine/Supply Name</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Qty Ordered</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Qty Received</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Unit</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Unit Price</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Total Price</th>
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Condition</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Verify</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {checklistItems.map((item, index) => (
              <tr key={index} className="text-sm text-slate-700 transition hover:bg-violet-50/50">
                <td className="px-4 py-4 font-semibold text-slate-950">{item.itemCode}</td>
                <td className="px-4 py-4 font-medium text-slate-900">{item.itemName}</td>
                <td className="px-4 py-4">{item.quantityOrdered}</td>
                <td className="px-4 py-4">{item.quantityReceived}</td>
                <td className="px-4 py-4">{item.unit}</td>
                <td className="px-4 py-4">{item.unitPrice}</td>
                <td className="px-4 py-4 font-semibold text-slate-950">{item.totalPrice}</td>
                <td className="px-4 py-4">
                  {item.condition === 1
                    ? "Ok"
                    : item.condition === 2
                    ? "Damaged"
                    : item.condition === 0
                    ? "Rejected"
                    : "-"}
                </td>

                <td className="px-4 py-4 text-center">
                  {/* Checkbox to mark verified */}
                  <input
                    type="checkbox"
                    checked={item.verify}
                    onChange={() => handleVerifyItem(index)}
                  />
                </td>

                <td className="px-4 py-4 text-center">
                  {!isIdavailable && (
                    <>
                      <button
                        onClick={() => handleEditItem(index)}
                        className="mx-1 rounded-lg p-2 text-violet-600 transition hover:bg-violet-50"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="mx-1 rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                      >
                        <DeleteOutlined />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {/* Add/Edit Row */}
            {!isIdavailable && (
              <tr className="bg-slate-50/80">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={editForm.itemCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, itemCode: e.target.value })
                    }
                    placeholder="Product code"
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={editForm.itemName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, itemName: e.target.value })
                    }
                    placeholder="Medicine or supply name"
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={editForm.quantityOrdered}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        quantityOrdered: +e.target.value,
                      })
                    }
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={editForm.quantityReceived}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        quantityReceived: +e.target.value,
                      })
                    }
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={editForm.unit}
                    onChange={(e) =>
                      setEditForm({ ...editForm, unit: e.target.value })
                    }
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={editForm.unitPrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, unitPrice: +e.target.value })
                    }
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={editForm.totalPrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, totalPrice: +e.target.value })
                    }
                    className="app-control h-10 w-full text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={editForm.condition}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        condition: Number(e.target.value),
                      })
                    }
                    className="app-control h-10 w-full text-sm"
                  >
                    <option value="">Select</option>
                    <option value={1}>Accepted</option>
                    <option value={2}>Damaged</option>
                    <option value={0}>Rejected</option>
                  </select>
                </td>

                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={editForm.verify}
                    onChange={(e) =>
                      setEditForm({ ...editForm, verify: e.target.checked })
                    }
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  {editingIndex === null ? (
                    <button
                      onClick={handleAddItem}
                      className="app-button-primary min-h-[36px] px-3 py-1 text-xs"
                    >
                      Add
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveItem}
                        className="min-h-[36px] rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button
          className="app-button-secondary min-w-[104px]"
          onClick={handleCancelform}
        >
          {type === "create" ? "Cancel" : "Back"}
        </button>
        {!isIdavailable && (
          <button
            className="app-button-primary min-w-[112px]"
            onClick={handleSave}
          >
            {type === "create" ? "Submit" : "Update"}
          </button>
        )}
      </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
