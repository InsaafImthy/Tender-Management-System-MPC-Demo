import React, { useEffect, useMemo, useState } from "react";
import TextField from "../../components/basic_components/TextField";
import { DeliveryDetailsIconMain, EditIconMain } from "../../utils/Icons";
import DateTimePicker from "../../components/basic_components/date_time_picker/DateTimePicker";
import { message, Select } from "antd";
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
  const [upload, setUpload] = useState<{ files: FileList | null }>({
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
        `This will replace all ${checklistItems.length} existing items. Continue?`
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
        itemName: item.itemName,
        itemCode: item.itemCode,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
        unit: item.unit.toString(),
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        condition: item.condition,
        verify: item.verify,
      }));

      setchecklistItems(newItems);
      message.success(`Imported ${newItems.length} items successfully.`);
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

  const handleEditclick= () => {
    setIsIdavailable(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-[#1365AA] flex items-center justify-center text-white">
          <DeliveryDetailsIconMain />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Confirm Delivery</h1>
          <p className="text-gray-600">Record receipt of delivered materials</p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between">
          <h3 className="text-base font-semibold mb-4">Delivery Information</h3>
          {isIdavailable && <EditIconMain onClick={handleEditclick}/>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
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
              disabled={isIdavailable}
              placeholder="Enter delivery ID"
              type="number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">
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
              placeholder="Enter Delivery Location"
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Project Site <span className="text-red-500">*</span>
            </label>
            <TextField
              required
              id="projectSite"
              field="Project Site"
              value={deliveryData.projectSite}
              setValue={(val: string) =>
                setDeliveryData({ ...deliveryData, projectSite: val })
              }
              disabled={isIdavailable}
              placeholder="Enter  project site"
              type="text"
            />
          </div>
        </div>
      </div>
      {/* Excel Upload */}
      {!isIdavailable && (
        <div className="mt-8 p-6 border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
          <h3 className="text-lg font-semibold">Upload Items</h3>
          <input
            type="file"
            id="excel-upload"
            accept=".csv,.xls,.xlsx"
            onChange={handleExcelUpload}
            className="hidden"
          />
          <label
            htmlFor="excel-upload"
            className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg cursor-pointer"
          >
            <UploadOutlined className="mr-2" />
            Upload File
          </label>
        </div>
      )}
      {/* Items Table */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Item Code</th>
              <th className="px-4 py-3">Item Name</th>
              <th className="px-4 py-3">Qty Ordered</th>
              <th className="px-4 py-3">Qty Received</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Total Price</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Verify</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((item, index) => (
              <tr key={index} className="hover:bg-blue-50">
                <td className="px-4 py-3">{item.itemCode}</td>
                <td className="px-4 py-3">{item.itemName}</td>
                <td className="px-4 py-3">{item.quantityOrdered}</td>
                <td className="px-4 py-3">{item.quantityReceived}</td>
                <td className="px-4 py-3">{item.unit}</td>
                <td className="px-4 py-3">{item.unitPrice}</td>
                <td className="px-4 py-3">{item.totalPrice}</td>
                <td className="px-4 py-3">
                  {item.condition === 1
                    ? "Ok"
                    : item.condition === 2
                    ? "Damaged"
                    : item.condition === 0
                    ? "Rejected"
                    : "-"}
                </td>

                <td className="px-4 py-3 text-center">
                  {item.verify ? "✅" : "❌"}
                </td>
                <td className="px-4 py-3 text-center">
                  {!isIdavailable && (
                    <>
                      <button
                        onClick={() => handleEditItem(index)}
                        className="text-blue-600 mx-1"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="text-red-600 mx-1"
                      >
                        <DeleteOutlined />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {/* Add/Edit Row */}
            {!isIdavailable && <tr className="bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={editForm.itemCode}
                  onChange={(e) =>
                    setEditForm({ ...editForm, itemCode: e.target.value })
                  }
                  placeholder="Code"
                  className="border rounded p-2 w-full"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={editForm.itemName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, itemName: e.target.value })
                  }
                  placeholder="Name"
                  className="border rounded p-2 w-full"
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
                  className="border rounded p-2 w-full"
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
                  className="border rounded p-2 w-full"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={editForm.unit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unit: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={editForm.unitPrice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unitPrice: +e.target.value })
                  }
                  className="border rounded p-2 w-full"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={editForm.totalPrice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, totalPrice: +e.target.value })
                  }
                  className="border rounded p-2 w-full"
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
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select</option>
                  <option value={1}>Ok</option>
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
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveItem}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
          onClick={handleCancelform}
        >
          {type === "create" ? "Cancel" : "Back"}
        </button>
        {!isIdavailable && <button
          className="px-4 py-2 rounded-md bg-[#1365AA] text-white"
          onClick={handleSave}
        >
          {type === "create" ? "Submit" : "Update"}
        </button>}
      </div>
    </div>
  );
};

export default DeliveryPage;
