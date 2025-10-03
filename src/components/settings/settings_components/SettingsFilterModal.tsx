import React, { useEffect, useState } from "react";
import { IFilterDto } from "../../../types/commonTypes";
import { IDepartment } from "../../../types/departmentTypes";
import { IRole } from "../../../types/roleTypes";

interface SettingsFilterModalProp {
  setFilter: React.Dispatch<React.SetStateAction<IFilterDto>>;
  expenditureTypes?: any[];
  departments?: IDepartment[];
  filter: IFilterDto;
  defaultFilter: IFilterDto;
  setIsFilterModalOpen: (x: boolean) => void;
  type: "user" | "department" | "workflow" | "budgetallocation" | "role";
  roles?: IRole[]
}

const userStatuses = ["Active", "Inactive"];

const SettingsFilterModal: React.FC<SettingsFilterModalProp> = ({
  roles,
  filter,
  defaultFilter,
  departments,
  expenditureTypes,
  setFilter,
  setIsFilterModalOpen,
  type = "user",
}: SettingsFilterModalProp) => {

  const [tempfilter, setTempFilter] = useState<IFilterDto>(filter);
  
  // Initialize form control states with existing filter values
  const getFilterValue = (columnName: string) => {
    const field = filter.fields.find(f => f.columnName === columnName);
    return field ? field.value : "";
  };

  // State for form controls with initial values from filter
  const [status, setStatus] = useState(() => {
    const isActive = filter.fields.find(f => f.columnName === "isActive")?.value;
    if (isActive === true) return "Active";
    if (isActive === false) return "Inactive";
    return "";
  });
  
  const [selectedRole, setSelectedRole] = useState(() => 
    getFilterValue("roleId") ? String(getFilterValue("roleId")) : "");
  
  const [selectedDepartment, setSelectedDepartment] = useState(() => 
    type === "user" 
      ? getFilterValue("departmentId") ? String(getFilterValue("departmentId")) : ""
      : getFilterValue("departmentId") ? String(getFilterValue("departmentId")) : "");
  
  const [selectedExpenditureType, setSelectedExpenditureType] = useState(() => 
    getFilterValue("expendituretypeId") ? String(getFilterValue("expendituretypeId")) : "");
  
  const [minBudget, setMinBudget] = useState(() => 
    getFilterValue("MinAmount") ? String(getFilterValue("MinAmount")) : "");
  
  const [maxBudget, setMaxBudget] = useState(() => 
    getFilterValue("MaxAmount") ? String(getFilterValue("MaxAmount")) : "");

  function setupColumns(
    column: string,
    operator: "=" | "!=" | "<" | "<=" | ">" | ">=" | "ILIKE" = "=",
    value: string | boolean | undefined,
    valueType: "number" | "default" | "boolean" = "default"
  ) {
    let columnExist = tempfilter.fields.find((c) => c.columnName === column);
    if (
      (value !== "" && valueType === "default") ||
      (value !== "" && !isNaN(Number(value)) && valueType === "number") ||
      ((value === true || value === false) && valueType === "boolean")
    ) {
      console.log(value,"value")
      if (columnExist) {
        setTempFilter((x) => ({
          ...x,
          fields: x.fields.map((f) =>
            f.columnName === column
              ? { ...f, operator, value: valueType === "number" ? Number(value) : value }
              : f
          ),
        }));
      } else {
        setTempFilter((x) => ({
          ...x,
          fields: [
            ...x.fields,
            { columnName: column, operator, value: valueType === "number" ? Number(value) : value },
          ],
        }));
      }
    } else {
      setTempFilter((x) => ({
        ...x,
        fields: tempfilter.fields.filter((f) => f.columnName !== column),
      }));
    }
  }

  useEffect(()=>{
    console.log(tempfilter,"tempfilter")
  },[tempfilter])

  function resetFilters() {
    // Reset the tempfilter state to defaultFilter
    setTempFilter(defaultFilter);
    
    // Reset all form control states
    setStatus("");
    setSelectedRole("");
    setSelectedDepartment("");
    setSelectedExpenditureType("");
    setMinBudget("");
    setMaxBudget("");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-3 text-gray-600">Apply Filters</h3>
        <div className="space-y-3">
          {/* User Filters */}
          {type === "user" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setupColumns(
                      "isActive", 
                      undefined, 
                      e.target.value === "Active" ? true : 
                      e.target.value === "Inactive" ? false : 
                      undefined, 
                      "boolean"
                    );
                  }}
                >
                  <option value="" disabled>select</option>
                  {userStatuses.map((statusItem, index) => (
                    <option key={index} value={statusItem}>
                      {statusItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Roles</label>
                {roles && <select
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setupColumns("roleId", undefined, e.target.value);
                  }}
                >
                  <option value="" disabled>select</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role.id}>
                      {role.roleName}
                    </option>
                  ))}
                </select>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                {departments && <select
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setupColumns("departmentId", undefined, e.target.value);
                  }}
                >
                  <option value="" disabled>select</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>}
              </div>
            </>
          )}

          {/* Workflow Filters */}
          {type === "workflow" && (
            <>
            <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                {departments && <select
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setupColumns("departmentId", undefined, e.target.value);
                  }}
                >
                  <option value="" disabled>select</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ExpenditureType</label>
                {expenditureTypes && <select
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={selectedExpenditureType}
                  onChange={(e) => {
                    setSelectedExpenditureType(e.target.value);
                    setupColumns("expendituretypeId", undefined, e.target.value);
                  }}
                >
                  <option value="" disabled>select</option>
                  {expenditureTypes.map((expenditure, index) => (
                    <option key={index} value={expenditure.id}>
                      {expenditure.expenditureType}
                    </option>
                  ))}
                </select>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 px-2 py-1 border rounded text-sm"
                    value={minBudget}
                    onChange={(e) => {
                      setMinBudget(e.target.value);
                      setupColumns("MinAmount", ">=", e.target.value, "number");
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 px-2 py-1 border rounded text-sm"
                    value={maxBudget}
                    onChange={(e) => {
                      setMaxBudget(e.target.value);
                      setupColumns("MaxAmount", "<=", e.target.value, "number");
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Budget Allocation Filters */}
          {type === "budgetallocation" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                {departments && <select
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setupColumns("departmentId", undefined, e.target.value);
                  }}
                >
                  <option value="" disabled>select</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>}
              </div>
            </>
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
              className="px-4 py-2 bg-gray-300 rounded text-sm" 
              onClick={() => setIsFilterModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded text-sm" 
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsFilterModal;