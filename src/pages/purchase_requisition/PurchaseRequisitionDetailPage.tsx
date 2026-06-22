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
      <div className="admin-page flex items-center justify-center">
        <div className="app-surface px-8 py-6">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="admin-page flex items-center justify-center px-6">
        <div className="app-surface max-w-md p-8 text-center">
          <h2 className="mb-3 text-2xl font-bold text-slate-950">
            Requisition Not Found
          </h2>
          <Button className="app-button-secondary" onClick={() => navigate("/purchase-requisitions")}>
            Back to Requisitions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <CommonTitleCard />
      <div className="admin-content">

      {/* Header */}
      <div className="admin-page-header">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/purchase-requisitions")}
            className="app-button-secondary"
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
              className="app-button-primary"
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-950">
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
            <p className="text-lg text-slate-600">
              {requisition.requisitionNumber || `PR-${requisition.id}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="app-surface overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
              <h2 className="text-xl font-bold text-slate-950">
                Requisition Details
              </h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Department
                  </label>
                  <p className="mt-1 text-base font-medium text-slate-950">
                    {requisition.department?.departmentName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-500">
                    Requested By
                  </label>
                  <p className="mt-1 text-base font-medium text-slate-950">
                    {requisition.requestedBy || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-500">
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
                  <label className="text-sm font-semibold text-slate-500">
                    Required Date
                  </label>
                  <p className="mt-1 text-base font-medium text-slate-950">
                    {formatDate(requisition.requiredDate)}
                  </p>
                </div>
              </div>
              {requisition.notes && (
                <div className="border-t border-slate-200 pt-4">
                  <label className="text-sm font-semibold text-slate-500">
                    Notes / Justification
                  </label>
                  <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-700">
                    {requisition.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="app-surface overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950">
                  Requisition Products
                </h2>
                <span className="admin-count-badge">
                  {requisition.items?.length || 0} product(s)
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">
                      Product Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">
                      Medicine/Supply Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">
                      UOM
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">
                      Unit Cost
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {requisition.items?.map((item, index) => (
                    <tr key={index} className="transition hover:bg-violet-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {item.itemCode}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {item.itemName}
                        {item.description && (
                          <div className="mt-1 text-xs text-slate-500">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getUnitLabel(item.unit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                          {item.requestedQuantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        {fmt(item.estimatedCost)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-slate-950">
                        {fmt(item.requestedQuantity * item.estimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-right text-sm font-bold text-slate-950"
                    >
                      Total Estimated Cost:
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-emerald-700">
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
          <div className="app-surface overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-950">Timeline</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  Created
                </label>
                <p className="mt-1 text-sm font-medium text-slate-950">
                  {formatDate(requisition.createdAt || "")}
                </p>
              </div>
              {requisition.updatedAt && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm font-medium text-slate-950">
                    {formatDate(requisition.updatedAt)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  Required By
                </label>
                <p className="mt-1 text-sm font-semibold text-amber-600">
                  {formatDate(requisition.requiredDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-[0_22px_60px_rgba(109,40,217,0.28)]">
            <h3 className="text-lg font-bold mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-violet-100">Total Products</span>
                <span className="text-2xl font-bold">
                  {requisition.items?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-violet-100">Total Quantity</span>
                <span className="text-2xl font-bold">
                  {requisition.items?.reduce(
                    (sum, item) => sum + item.requestedQuantity,
                    0
                  ) || 0}
                </span>
              </div>
              <div className="border-t border-violet-300/50 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-violet-100">Est. Total Cost</span>
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
    </div>
  );
};

export default PurchaseRequisitionDetailPage;

