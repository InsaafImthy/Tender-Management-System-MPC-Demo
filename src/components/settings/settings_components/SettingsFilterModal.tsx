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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="app-surface w-full max-w-md p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Filters</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Apply Filters</h3>
        </div>
        <div className="space-y-4">
          {/* User Filters */}
          {type === "user" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
                <select
                  className="app-control h-11 w-full text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Roles</label>
                {roles && <select
                  className="app-control h-11 w-full text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label>
                {departments && <select
                  className="app-control h-11 w-full text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label>
                {departments && <select
                  className="app-control h-11 w-full text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Expenditure Type</label>
                {expenditureTypes && <select
                  className="app-control h-11 w-full text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Budget Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="app-control h-11 w-full text-sm"
                    value={minBudget}
                    onChange={(e) => {
                      setMinBudget(e.target.value);
                      setupColumns("MinAmount", ">=", e.target.value, "number");
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="app-control h-11 w-full text-sm"
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Department</label>
                {departments && <select
                  className="app-control h-11 w-full text-sm"
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

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
            <button 
              className="app-button-primary min-w-[128px]"
              onClick={() => { 
                setFilter(tempfilter); 
                setIsFilterModalOpen(false); 
              }}
            >
              Apply Filters
            </button>
            <button 
              className="app-button-secondary min-w-[96px]"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="inline-flex min-h-[44px] min-w-[96px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
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
