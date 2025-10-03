import React, { useState } from "react";
import { IFilterDto } from "../../../types/commonTypes";

interface SettingsSortModalProps {
  filter: IFilterDto;
  setFilter: React.Dispatch<React.SetStateAction<IFilterDto>>;
  setIsSettingsSortModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type?: "user" | "department" | "workflow" | "budgetallocation" | "role" | "category";
}

const sortColumns = {
  user: [
    { key: "createdAt", label: "Date Added" },
    { key: "updatedAt", label: "Last Updated" },
    { key: "name", label: "Name" },
    { key: "roleId", label: "Role" },
    { key: "departmentId", label: "Department" },
    { key: "isActive", label: "Status" },
  ],
  department: [
    { key: "createdAt", label: "Date Added" },
    { key: "updatedAt", label: "Last Updated" },
    { key: "departmentCode", label: "Department ID" },
    { key: "departmentName", label: "Department Name" },
  ],
  workflow: [
    { key: "createdAt", label: "Date Added" },
    { key: "updatedAt", label: "Last Updated" },
    { key: "expendituretypeId", label: "Expenditure Type" },
    { key: "departmentId", label: "Department" },
    { key: "minAmount", label: "Amount" }
  ],
  budgetallocation: [
    { key: "createdAt", label: "Date Added" },
    { key: "updatedAt", label: "Last Updated" },
    { key: "departmentId", label: "Department" }
  ],
  role:[{ key: "createdAt", label: "Date Added" },
    { key: "updatedAt", label: "Last Updated" },
    { key: "roleName", label: "Role" }],
    
  category:[{ key: "createdAt", label: "Date Added" },
    { key: "updatedAt", label: "Last Updated" },
    { key: "categoryId", label: "Category" }]
};

const SettingsSortModal: React.FC<SettingsSortModalProps> = ({
  filter,
  setFilter,
  setIsSettingsSortModalOpen,
  type = "user",
}) => {
  const [sortOptions, setSortOptions] = useState({
    field: filter.sortColumn,
    direction: filter.sortDirection,
  });

  const applySorting = (column: string) => {
    const newDirection =
      sortOptions.field === column && sortOptions.direction === "ASC" ? "DESC" : "ASC";
    setSortOptions({ field: column, direction: newDirection });
    setFilter((prev) => ({ ...prev, sortColumn: column, sortDirection: newDirection }));
    setIsSettingsSortModalOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded shadow-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-600">Sort By</h3>
        <div className="space-y-3">
          {sortColumns[type].map((column) => (
            <button
              key={column.key}
              className="w-full px-4 py-2 text-left text-sm border-b hover:bg-blue-100"
              onClick={() => applySorting(column.key)}
            >
              {column.label} {sortOptions.field === column.key ? `(${sortOptions.direction})` : ""}
            </button>
          ))}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded text-sm"
              onClick={() => setIsSettingsSortModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSortModal;