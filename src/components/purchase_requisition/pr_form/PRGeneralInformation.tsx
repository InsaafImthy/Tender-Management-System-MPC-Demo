import React, { SetStateAction } from "react";
import TextField from "../../basic_components/TextField";
import SelectField from "../../basic_components/SelectField";
import DateTimePicker from "../../basic_components/date_time_picker/DateTimePicker";
// import DateTimePicker from "../../basic_components/date_time_picker/DateTimePicker";

interface PRGeneralInformationProps {
  formData: any;
  setFormData: React.Dispatch<SetStateAction<any>>;
  masterData: any;
  currentUserName: string;
}

const priorityOptions = [
  { label: "Low", value: "0" },
  { label: "Medium", value: "1" },
  { label: "High", value: "2" },
  { label: "Urgent", value:" 3" },
];

const PRGeneralInformation: React.FC<PRGeneralInformationProps> = ({
  formData,
  setFormData,
  masterData,
  currentUserName,
}) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Requisition Information
          </h2>
          <p className="text-gray-600 mt-1">
            Enter the basic details for this purchase requisition
          </p>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Requisition Title */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Requisition Title <span className="text-red-500">*</span>
            </label>
            <TextField
              required={true}
              id="requisitionTitle"
              field="requisitionTitle"
              value={formData?.requisitionTitle || ""}
              setValue={(value) =>
                setFormData((prev: any) => ({
                  ...prev,
                  requisitionTitle: value,
                }))
              }
              placeholder="Enter requisition title"
              style="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              type="text"
              width="w-full"
            />
          </div>

          {/* Department */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Department <span className="text-red-500">*</span>
            </label>
            <SelectField
              search={false}
              id="departmentId"
              label=""
              style="w-full"
              value={
                masterData?.departments?.find(
                  (x: any) => Number(x?.id) === Number(formData?.departmentId)
                )?.departmentName || "Select department"
              }
              options={(masterData?.departments || []).map((x: any) => ({
                label: (
                  <span className="text-md font-medium">
                    {x.departmentName}
                  </span>
                ),
                value: x.id,
              }))}
              onChange={(selectedValue) => {
                setFormData((prev: any) => ({
                  ...prev,
                  departmentId: Number(selectedValue),
                }));
              }}
            />
          </div>

          {/* Requested By */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Requested By
            </label>
            <TextField
              id="requestedBy"
              field="requestedBy"
              value={currentUserName}
              setValue={() => {}}
              disabled={true}
              placeholder="Requested by"
              style="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              type="text"
              width="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              Auto-filled with your name
            </p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Priority */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Priority <span className="text-red-500">*</span>
            </label>
            <SelectField
              search={false}
              id="priority"
              label=""
              style="w-full"
              value={priorityOptions.find((x) => x.value === formData?.priority)
                ?.label || "Select priority"}
              options={priorityOptions.map((x) => ({
                label: (
                  <span className="text-md font-medium">{x.label}</span>
                ),
                value: x.value,
              }))}
              onChange={(selectedValue) => {
                setFormData((prev: any) => ({
                  ...prev,
                  priority: Number(selectedValue),
                }));
              } } />
          </div>

          {/* Required Date */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <DateTimePicker
              label="Required date"
              value={formData?.requiredDate}
              setValue={(val) =>
                setFormData((prev: any) => ({
                  ...prev,
                  requiredDate: val,
                }))
              }
            />
          </div>

          {/* Notes / Justification */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Notes / Justification
            </label>
            <TextField
              id="notes"
              field="notes"
              value={formData?.notes || ""}
              setValue={(value) =>
                setFormData((prev: any) => ({
                  ...prev,
                  notes: value,
                }))
              }
              placeholder="Enter notes or justification for this requisition"
              style="min-h-[100px]"
              type="textarea"
              width="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PRGeneralInformation;
