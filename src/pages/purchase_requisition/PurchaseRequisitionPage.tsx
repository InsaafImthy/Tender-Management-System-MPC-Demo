import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { message } from "antd";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import Table from "../../components/basic_components/Table";
import CreateButton from "../../components/buttons/CreateButton";
import { getAllPurchaseRequisitionsAsync } from "../../services/purchaseRequisitionService";
import { IPurchaseRequisition } from "../../types/purchaseRequisitionTypes";
import { defaultFilter } from "../../utils/constants";

const PurchaseRequisitionPage: React.FC = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<IPurchaseRequisition[]>([]);
  const [, setIsLoading] = useState<boolean>(false);
  const [currentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 10;

  useEffect(() => {
    loadRequisitions();
  }, [currentPage]);

  const loadRequisitions = async () => {
    try {
      setIsLoading(true);
      const filter = {
        ...defaultFilter,
        pageNo: currentPage,
        pageSize: pageSize,
      };
      const response = await getAllPurchaseRequisitionsAsync(filter);
      setRequisitions(response.data);
      setTotalCount(response.count);
    } catch (err) {
      console.error("Error loading purchase requisitions:", err);
      // message.error("Failed to load purchase requisitions");
    } finally {
      setIsLoading(false);
      console.log(columns);
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
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "requisitionNumber",
      label: "Requisition #",
      render: (item: IPurchaseRequisition) => (
        <span className="font-semibold text-blue-600">
          {item.requisitionNumber || `PR-${item.id}`}
        </span>
      ),
    },
    {
      key: "requisitionTitle",
      label: "Title",
      render: (item: IPurchaseRequisition) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.requisitionTitle}
          </div>
          {item.notes && (
            <div className="text-xs text-gray-500 truncate max-w-xs">
              {item.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (item: IPurchaseRequisition) => (
        <span className="text-sm text-gray-700">
          {item.department?.departmentName || "N/A"}
        </span>
      ),
    },
    {
      key: "requestedBy",
      label: "Requested By",
      render: (item: IPurchaseRequisition) => (
        <span className="text-sm text-gray-700">
          {item.requestedBy || "N/A"}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (item: IPurchaseRequisition) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
            item.priority
          )}`}
        >
          {getPriorityLabel(item.priority)}
        </span>
      ),
    },
    {
      key: "requiredDate",
      label: "Required Date",
      render: (item: IPurchaseRequisition) => (
        <span className="text-sm text-gray-700">
          {formatDate(item.requiredDate)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: IPurchaseRequisition) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            item.status || 0
          )}`}
        >
          {getStatusLabel(item.status || 0)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (item: IPurchaseRequisition) => (
        <span className="text-sm text-gray-700">
          {formatDate(item.createdAt || "")}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <CommonTitleCard />
      <div className="admin-content">
        

        {/* Header */}
        <div className="admin-page-header mb-6">
          <div className="admin-page-header-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Purchase Requisitions
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track all purchase requisitions
              </p>
            </div>
            <CreateButton
              name="Create Requisition"
              onClick={() => navigate("/purchase-requistition/create")}
            />
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {requisitions.filter((r) => r.status === 1).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {requisitions.filter((r) => r.status === 2).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Urgent</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {requisitions.filter((r) => r.priority === 3).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">🔥</span>
            </div>
          </div>
        </div>
      </div> */}

        {/* Table */}
        <div className="admin-panel">
          <Table
            columns={[
              "requisitionNumber",
              "requisitionTitle",
              "department",
              "requestedBy",
              "priority",
              "requiredDate",
              "status",
              "createdAt",
            ]}
            columnLabels={{
              requisitionNumber: "Requisition",
              requisitionTitle: "Title",
              department: "Department",
              requestedBy: "Requested By",
              priority: "Priority",
              requiredDate: "Required Date",
              status: "Status",
              createdAt: "Created At",
            }}
            type={"vendors"}
            items={requisitions}
            totalCount={totalCount}
            onView={(item) => navigate(`/purchase-requisitions/${item.id}`)}
            NoDataTitle="No Purchase Requisitions Found"
            NoDataDescription={
              "There are currently no purchase requisitions to display"
            }
            title="Purchase Requisitions"
            subtitle="Manage and track purchase requisitions"
            IsIcon={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequisitionPage;
