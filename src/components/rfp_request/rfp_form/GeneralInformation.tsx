import React, { SetStateAction } from "react";
import TextField from "../../basic_components/TextField";
import SelectField from "../../basic_components/SelectField";
import PeoplePicker from "../../basic_components/PeoplePicker";
import { Select } from "antd";


interface GeneralInformationProps {
  requestData: any;
  setRequestData: React.Dispatch<SetStateAction<any>>;
  masterData: any;
}

const GeneralInformation: React.FC<GeneralInformationProps> = ({
  requestData,
  setRequestData,
  masterData,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">General Information</h2>
            <p className="text-gray-600 mt-1 text-sm">Basic details about your RFP request</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            {/* RFP Title */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFP Title <span className="text-red-500">*</span>
              </label>
              <TextField
                required={true}
                id="rfpTitle"
                field="rfpTitle"
                value={requestData?.rfpTitle || ""}
                setValue={(value) =>
                  setRequestData((prev: any) => ({ ...prev, rfpTitle: value }))
                }
                placeholder="Enter RFP Title"
                style="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                type="text"
                width="w-full"
              />
            </div>

            {/* RFP Description */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                RFP Description
              </label>
              <TextField
                id="rfpDescription"
                field="rfpDescription"
                value={requestData?.rfpDescription || ""}
                setValue={(value) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    rfpDescription: value,
                  }))
                }
                placeholder="Enter RFP description"
                style="min-h-[50px]"
                type="textarea"
                width="w-full"
              />
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category <span className="text-red-500">*</span>
              </label>
                <Select
                  className="h-[41px]"
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Select category"
                  value={requestData?.rfpCategories?.map((item: any) => (item.categoryId))}
                  // defaultValue={[]}
                  onChange={(selectedValue) => {
                    setRequestData((prev: any) => ({
                      ...prev,
                      rfpCategories: selectedValue?.map((item: string) => ({ categoryId: Number(item), rfpId: 0 })),
                    }));
                  }}
                  options={(masterData?.categories || []).map((x: any) => ({
                    label: <span className="text-md font-medium">{x.name}</span>,
                    value: x.id,
                  }))}
                />
            </div>

            {/* Purchase Requisition ID */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Purchase Requisition ID
              </label>
              <TextField
                id="purchaseRequisitionId"
                field="purchaseRequisitionId"
                value={requestData?.purchaseRequisitionId || ""}
                setValue={(value) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    purchaseRequisitionId: value,
                  }))
                }
                placeholder="Purchase Requisition ID"
                style=""
                type="text"
                width="w-full"
              />
            </div>

          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {/* Organization */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Organization
              </label>
              <TextField
                id="organizationId"
                field="organizationId"
                value={requestData?.buyerOrganizationName || ""}
                setValue={(value) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    buyerOrganizationName: value,
                  }))
                }
                disabled
                placeholder="Purchase Requisition ID"
                style=""
                type="text"
                width="w-full"
              />
            </div>

            {/* Organization */}
            {/* <div className="w-full mb-4">
              <label className="block text-sm font-medium mb-2">
                Organization <span className="text-red-500">*</span>
              </label>
              <SelectField
                id="organizationId"
                label=""
                style="w-full"
                value={
                  masterData?.companies?.find(
                    (x: any) =>
                      x?.companyName === requestData?.buyerOrganizationName
                  )?.companyName ||
                  masterData?.companies?.find(
                    (x: any) =>
                      x?.id.toString() === getUserCredentials().companyId
                  )?.companyName
                }
                options={(masterData?.companies || []).map((x: any) => ({
                  label: (
                    <span className="text-md font-medium">{x.companyName}</span>
                  ),
                  value: x.id,
                }))}
                onChange={(selectedValue) => {
                  setRequestData((prev: any) => ({
                    ...prev,
                    buyerOrganizationName: selectedValue,
                  }));
                }}
              />
            </div> */}

            {/* Buyer Department */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Buyer Department <span className="text-red-500">*</span>
              </label>
              <SelectField
                search={false}
                id="departmentId"
                label=""
                style="w-full"
                value={
                  masterData?.departments?.find(
                    (x: any) => Number(x?.id) == Number(requestData?.departmentId)
                  )?.departmentName || "Select department"
                }
                options={(masterData?.departments)?.map((x: any) => ({
                  label: (
                    <span className="text-md font-medium">{x.departmentName}</span>
                  ),
                  value: x.id,
                }))}
                onChange={(selectedValue) => {
                  const newDeptId = Number(selectedValue);
                  const isDeptChanged = requestData?.departmentId !== newDeptId;

                  setRequestData((prev: any) => ({
                    ...prev,
                    departmentId: newDeptId,
                    ...(isDeptChanged ? { buyer: [], buyerName: "" } : {}),
                  }));
                }}
              />
            </div>

            {/* Buyer */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Buyer
              </label>
              <PeoplePicker
                users={masterData?.users}
                setValue={(val) => { setRequestData((prev: any) => ({ ...prev, buyer: val.length ? [val[val.length - 1]] : [], buyerName: val.length ? val[val.length - 1].name : "" })) }}
                value={requestData && requestData?.buyer ? requestData?.buyer : []}
                label=""
                height={"41px"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformation;
