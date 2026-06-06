import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import PRGeneralInformation from "./PRGeneralInformation";
import PRBomItems from "./PRBomItems";
import CommonTitleCard from "../../basic_components/CommonTitleCard";
import { ClipboardMainIcon } from "../../../utils/Icons";
import { getAllDepartmentsAsync } from "../../../services/departmentService";
import { getUserCredentials } from "../../../utils/common";
import {
  createPurchaseRequisitionAsync,
  updatePurchaseRequisitionAsync,
  getPurchaseRequisitionByIdAsync,
} from "../../../services/purchaseRequisitionService";
import {
  IPurchaseRequisition,
  IPurchaseRequisitionItem,
} from "../../../types/purchaseRequisitionTypes";

type PRFormType = "create" | "edit";

interface PurchaseRequisitionFormProps {
  type?: PRFormType;
}

const defaultPRState: Partial<IPurchaseRequisition> = {
  requisitionTitle: "",
  departmentId: Number(getUserCredentials().departmentId || "0"),
  requestedBy: getUserCredentials().name,
  requestedById: Number(getUserCredentials().userId || "0"),
  priority: 1, // Default to Medium
  requiredDate: "",
  notes: "",
  items: [],
  selectedBoms: [],
};

const PurchaseRequisitionForm: React.FC<PurchaseRequisitionFormProps> = ({
  type = "create",
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<Partial<IPurchaseRequisition>>(
    defaultPRState
  );
  const [selectedBoms, setSelectedBoms] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<any>({
    departments: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const currentUserName = getUserCredentials().name;

  useEffect(() => {
    setupFormAsync();
  }, []);

  const setupFormAsync = async () => {
    try {
      const departments = await getAllDepartmentsAsync();
      setMasterData({
        departments: departments.data,
      });

      if (id && !isNaN(Number(id)) && type === "edit") {
        try {
          const prData = await getPurchaseRequisitionByIdAsync(Number(id));
          setFormData(prData);
          // If BOM data is included in the response, populate selectedBoms
          if (prData.selectedBoms) {
            setSelectedBoms(prData.selectedBoms);
          }
        } catch (err) {
          console.error("Error loading purchase requisition:", err);
          message.error("Failed to load purchase requisition data");
        }
      }
    } catch (err) {
      console.error("Error setting up form:", err);
      message.error("Failed to load form data");
    }
  };

  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.requisitionTitle?.trim()) {
      message.error("Please enter a requisition title");
      return false;
    }

    if (!formData.departmentId || formData.departmentId === 0) {
      message.error("Please select a department");
      return false;
    }

    if (formData.priority === undefined || formData.priority === null) {
      message.error("Please select a priority");
      return false;
    }

    if (!formData.requiredDate) {
      message.error("Please select a required date");
      return false;
    }

    // Validate that at least one product list with items is selected
    if (!selectedBoms || selectedBoms.length === 0) {
      message.error("Please add at least one product");
      return false;
    }

    // Check if all product lists have items
    const hasEmptyBom = selectedBoms.some(
      (bom) => !bom.bomItemDtos || bom.bomItemDtos.length === 0
    );
    if (hasEmptyBom) {
      message.error("All selected product lists must have at least one product");
      return false;
    }

    return true;
  };

  const handleSubmitClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      // Prepare items from selected BOMs
      const items: Omit<IPurchaseRequisitionItem, "id">[] = [];
      
      selectedBoms.forEach((bom) => {
        bom.bomItemDtos.forEach((item: any) => {
          items.push({
            itemCode: item.itemCode,
            itemName: item.itemName,
            description: item.description || "",
            unit: item.unit,
            requestedQuantity: item.quantity,
            estimatedCost: item.price,
          });
        });
      });

      const payload = {
        requisitionTitle: formData.requisitionTitle!,
        departmentId: formData.departmentId!,
        requestedById: formData.requestedById,
        priority: formData.priority!,
        requiredDate: formData.requiredDate!,
        notes: formData.notes || "",
        items,
      };

      if (type === "edit" && id) {
        await updatePurchaseRequisitionAsync(Number(id), {
          ...payload,
          id: Number(id),
        });
        message.success("Purchase requisition updated successfully!");
        navigate(`/purchase-requistition/${id}`);
      } else {
        const result = await createPurchaseRequisitionAsync(payload);
        message.success(
          `Purchase requisition created successfully! Requisition Number: ${result.requisitionNumber || ""}`
        );
        navigate("/purchase-requistition");
      }
    } catch (err: any) {
      console.error("Error submitting purchase requisition:", err);
      message.error(
        err?.response?.data?.message ||
          "Failed to submit purchase requisition. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const getTotalItems = () => {
    return selectedBoms.reduce((total, bom) => {
      return total + (bom.bomItemDtos?.length || 0);
    }, 0);
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />

      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 mx-8 rounded-lg">
        <div className="max-w-7xl mx-auto px-6 py-8 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  <ClipboardMainIcon />
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {type === "create"
                    ? "Create Purchase Requisition"
                    : "Edit Purchase Requisition"}
                </h1>
                <p className="text-gray-600 mt-2 text-sm">
                  {type === "create"
                    ? "Fill in the details below to create a new purchase requisition"
                    : "Update the purchase requisition information as needed"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">
                  Purchase Requisition Form
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmitClick} className="space-y-8">
          {/* Form Sections */}
          <div className="space-y-8">
            <PRGeneralInformation
              formData={formData}
              setFormData={setFormData}
              masterData={masterData}
              currentUserName={currentUserName}
            />
            <PRBomItems
              selectedBoms={selectedBoms}
              setSelectedBoms={setSelectedBoms}
            />
          </div>

          {/* Form Actions */}
          <div className="mt-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">
                      {type === "create"
                        ? "Creating new purchase requisition"
                        : "Updating purchase requisition"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTotalItems()} products - {selectedBoms.length} product list(s)
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => {
                    navigate("/purchase-requisitions");
                  }}
                  className="px-8 py-3 h-auto border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="px-10 py-3 h-auto bg-gradient-to-r from-blue-400 to-[#1365AA] hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  loading={isLoading}
                  size="large"
                >
                  {type === "edit"
                    ? "Update Requisition"
                    : "Submit Requisition"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <ExclamationCircleOutlined className="text-blue-500 text-2xl" />
            <span className="text-xl font-semibold">
              Confirm Purchase Requisition Submission
            </span>
          </div>
        }
        open={showConfirmModal}
        onOk={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        okText="Yes, Submit"
        cancelText="Cancel"
        okButtonProps={{
          className:
            "bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600",
        }}
        width={600}
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Do you want to submit this Purchase Requisition?
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Requisition Title:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formData.requisitionTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Department:</span>
              <span className="text-sm font-semibold text-gray-900">
                {masterData.departments?.find(
                  (d: any) => d.id === formData.departmentId
                )?.departmentName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Priority:</span>
              <span className="text-sm font-semibold text-gray-900">
                {
                  ["Low", "Medium", "High", "Urgent"][
                    formData.priority || 0
                  ]
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Products:</span>
              <span className="text-sm font-semibold text-gray-900">
                {getTotalItems()}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Once submitted, this requisition will be sent for approval according
            to your organization's workflow.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseRequisitionForm;

