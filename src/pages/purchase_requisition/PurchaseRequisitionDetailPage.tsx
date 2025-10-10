import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, message, Spin } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { getPurchaseRequisitionByIdAsync } from "../../services/purchaseRequisitionService";
import { IPurchaseRequisition } from "../../types/purchaseRequisitionTypes";
import { commonUnits } from "../../utils/constants";

const PurchaseRequisitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState<IPurchaseRequisition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      loadRequisitionDetails();
    }
  }, [id]);

  const loadRequisitionDetails = async () => {
    try {
      setIsLoading(true);
      const data = await getPurchaseRequisitionByIdAsync(id!);
      setRequisition(data);
    } catch (err) {
      console.error("Error loading purchase requisition:", err);
      message.error("Failed to load purchase requisition details");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ["Low", "Medium", "High", "Urgent"];
    return labels[priority] || "Unknown";
  };

  const getPriorityColor = (priority: number) => {
    const colors = [
      "bg-gray-100 text-gray-800",
      "bg-blue-100 text-blue-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ];
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: number) => {
    const labels = [
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Partially Fulfilled",
      "Fulfilled",
    ];
    return labels[status] || "Unknown";
  };

  const getStatusColor = (status: number) => {
    const colors = [
      "bg-gray-100 text-gray-800",
      "bg-yellow-100 text-yellow-800",
      "bg-green-100 text-green-800",
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
    ];
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUnitLabel = (unitValue: number) => {
    const unit = commonUnits.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;

  const calculateTotal = () => {
    if (!requisition?.items) return 0;
    return requisition.items.reduce(
      (total, item) => total + item.requestedQuantity * item.estimatedCost,
      0
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Requisition Not Found
          </h2>
          <Button onClick={() => navigate("/purchase-requisitions")}>
            Back to Requisitions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <CommonTitleCard />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/purchase-requisitions")}
            className="flex items-center"
          >
            Back to Requisitions
          </Button>
          <div className="flex items-center gap-3">
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/purchase-requisitions/edit/${requisition.id}`)
              }
              type="primary"
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {requisition.requisitionTitle}
              </h1>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  requisition.status || 0
                )}`}
              >
                {getStatusLabel(requisition.status || 0)}
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              {requisition.requisitionNumber || `PR-${requisition.id}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Requisition Details
              </h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Department
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {requisition.department?.departmentName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Requested By
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {requisition.requestedBy || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Priority
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
                        requisition.priority
                      )}`}
                    >
                      {getPriorityLabel(requisition.priority)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Required Date
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(requisition.requiredDate)}
                  </p>
                </div>
              </div>
              {requisition.notes && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-600">
                    Notes / Justification
                  </label>
                  <p className="text-base text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg">
                    {requisition.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Requisition Items
                </h2>
                <span className="text-sm text-gray-600">
                  {requisition.items?.length || 0} item(s)
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Item Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      UOM
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                      Unit Cost
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requisition.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.itemCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.itemName}
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getUnitLabel(item.unit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {item.requestedQuantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        {fmt(item.estimatedCost)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                        {fmt(item.requestedQuantity * item.estimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-right text-sm font-bold text-gray-900"
                    >
                      Total Estimated Cost:
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-green-700">
                      {fmt(calculateTotal())}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Created
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(requisition.createdAt || "")}
                </p>
              </div>
              {requisition.updatedAt && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(requisition.updatedAt)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Required By
                </label>
                <p className="text-sm text-gray-900 mt-1 font-semibold text-orange-600">
                  {formatDate(requisition.requiredDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Total Items</span>
                <span className="text-2xl font-bold">
                  {requisition.items?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Total Quantity</span>
                <span className="text-2xl font-bold">
                  {requisition.items?.reduce(
                    (sum, item) => sum + item.requestedQuantity,
                    0
                  ) || 0}
                </span>
              </div>
              <div className="border-t border-blue-400 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Est. Total Cost</span>
                  <span className="text-2xl font-bold">
                    {fmt(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequisitionDetailPage;

