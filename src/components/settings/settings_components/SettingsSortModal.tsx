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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="app-surface w-full max-w-sm p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Sort</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Sort By</h3>
        </div>
        <div className="space-y-2">
          {sortColumns[type].map((column) => (
            <button
              key={column.key}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                sortOptions.field === column.key
                  ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/70 hover:text-violet-700"
              }`}
              onClick={() => applySorting(column.key)}
            >
              {column.label} {sortOptions.field === column.key ? `(${sortOptions.direction})` : ""}
            </button>
          ))}
          <div className="mt-5 flex justify-end">
            <button
              className="app-button-secondary min-w-[104px]"
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
