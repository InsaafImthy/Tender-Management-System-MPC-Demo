import React, { useState } from "react";
import { IFilterDto } from "../../types/commonTypes";

export interface IRequestStatus {
  label: string;
  value: any;
}

interface RfpFilterModalProp {
  setFilter: React.Dispatch<React.SetStateAction<IFilterDto>>;
  status?: IRequestStatus[];
  setIsFilterModalOpen: (x: boolean) => void;
  type?: "request" | "project" | "milestone";
  defaultFilter: IFilterDto;
  filter:IFilterDto;
}

const RfpFilterModal: React.FC<RfpFilterModalProp> = ({
  status = [],
  setFilter,
  defaultFilter,
  filter,
  setIsFilterModalOpen,
}: RfpFilterModalProp) => {
  const [tempfilter, setTempFilter] = useState<IFilterDto>(defaultFilter);

  // const [budgetMin, setBudgetMin] = useState("");
  // const [budgetMax, setBudgetMax] = useState("");
  // const [department, setDepartment] = useState("");
  // const [expenditureType, setExpenditureType] = useState("");
  

  function setupColumns(
    column: string,
    operator: "=" | "!=" | "<" | "<=" | ">" | ">=" | "ILIKE" = "=",
    value: string,
    valueType: "number" | "default" = "default"
  ) {
    let columnExist = tempfilter.fields.find((c) => c.columnName === column);
    if (
      (value !== "" && !isNaN(Number(value)) && valueType === "number") ||
      (value !== "" && valueType === "default")
    ) {
      if (columnExist) {
        setTempFilter((x) => ({
          ...x,
          fields: x.fields.map((f) =>
            f.columnName === column ? { ...f, operator, value: valueType === "number" ? Number(value) : value } : f
          ),
        }));
      } else {
        setTempFilter((x) => ({
          ...x,
          fields: [...x.fields, { columnName: column, operator, value: valueType === "number" ? Number(value) : value }],
        }));
      }
    } else {
      setTempFilter((x) => ({
        ...x,
        fields: tempfilter.fields.filter((f) => f.columnName !== column),
      }));
    }
  }

  function resetFilters() {
    setTempFilter(defaultFilter);
    // setBudgetMin("");
    // setBudgetMax("");
    // setDepartment("");
    // setExpenditureType("");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded shadow-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-600">Apply Filters</h3>
        {/* <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Budget Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 px-2 py-1 border rounded text-sm"
                value={budgetMin}
                onChange={(e) => {
                  setBudgetMin(e.target.value);
                  setupColumns(budgetMinColumn, "=", (Number(e.target.value)-1).toString(), "number");
                }}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 px-2 py-1 border rounded text-sm"
                value={budgetMax}
                onChange={(e) => {
                  setBudgetMax(e.target.value);
                  setupColumns(budgetMaxColumn, "=", (Number(e.target.value)+1).toString(), "number");
                }}
              />
            </div>
          </div> */}
          {/* {departments && (
            <div>
              <label className="block text-sm font-medium mb-1 text-md">Department</label>
              <select
                className="w-full px-2 py-1 border rounded text-sm"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setupColumns("requestingDepartmentId", "=", e.target.value);
                }}
              >
                <option value="">All</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          )} */}
          {/* {expenditureTypes && (
            <div>
              <label className="block text-sm font-medium text-md mb-1">Expenditure Type</label>
              <select
                className="w-full px-2 py-1 border rounded text-sm"
                value={expenditureType}
                onChange={(e) => {
                  setExpenditureType(e.target.value);
                  setupColumns("expenditureTypeId", "=", e.target.value);
                }}
              >
                <option value="">All</option>
                {expenditureTypes.map((type, index) => (
                  <option key={index} value={type.id}>
                    {type.expenditureType}
                  </option>
                ))}
              </select>
            </div>
          )} */}
          {status.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-md mb-1">Status</label>
              <select
                className="w-full px-2 py-1 border rounded text-sm"
                value={filter.fields.find(f=>f.columnName == "isOpen")?.value?.toString()}
                onChange={(e) => {
                  setupColumns("isOpen", "=", e.target.value);
                }}
              >
                <option value="">All</option>
                {status.map((type, index) => (
                  <option key={index} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-4 flex space-x-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
              onClick={() => {
                setFilter(tempfilter);
                setIsFilterModalOpen(false);
              }}
            >
              Apply Filters
            </button>
            <button
              className="ml-2 px-4 py-2 bg-gray-300 rounded text-sm"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded text-sm"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
  );
};

export default RfpFilterModal;
