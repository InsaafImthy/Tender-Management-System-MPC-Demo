import React, { SetStateAction } from "react";
import SelectField from "../../basic_components/SelectField";
import { currencies, currenciesWithLabel } from "../../../utils/constants";
import { convertCurrencyLabel, convertCurrencyWithLabel } from "../../../utils/common";
import TextField from "../../basic_components/TextField";

interface RfpDetailsProps {
  requestData: any;
  setRequestData: React.Dispatch<SetStateAction<any>>;
  masterData: any;
}

const RfpDetails: React.FC<RfpDetailsProps> = ({
  requestData,
  setRequestData,
}) => {
  const yesNoOptions: { label: string; value: any }[] = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">RFP Details</h2>
            <p className="text-gray-600 mt-1">Financial and operational specifications</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            {/* Serial or Parallel */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Serial or Parallel</label>
              <div className="flex space-x-4">
                {[{ title: 'Serial', value: true }, { title: 'Parallel', value: false }].map((option, i) => (
                  <label key={i} className="flex items-center">
                    <input
                      type="radio"
                      name="isSerial"
                      checked={requestData.isSerial === option.value}
                      onChange={() =>
                        setRequestData((prev: any) => ({
                          ...prev,
                          isSerial: option.value,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">{option.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                RFP Currency <span className="text-red-500">*</span>
              </label>
              <SelectField
                search={false}
                id="rfpCurrency"
                label=""
                style="w-full"
                value={
                  convertCurrencyWithLabel(
                    currenciesWithLabel.find((x) => x.value === requestData?.rfpCurrency)?.value || "USD"
                  ) as string
                }
                options={(currenciesWithLabel || []).map((x) => ({
                  label: <span className="text-md font-medium">{x.label}</span>,
                  value: x.value,
                }))}
                onChange={(selectedValue) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    rfpCurrency: selectedValue,
                  }))
                }
              />
            </div>

            {/* Bid Amount */}
            {/* <div className="w-full mb-4">
              <label className="block text-sm font-medium mb-2">
                Bid Amount
              </label>
              <div className="flex">
                <div className="border border-gray-300 rounded px-3 py-2 h-[34px] flex items-center bg-white text-sm">
                  {convertCurrencyLabel(
                    currencies.find((x) => x.value === requestData?.rfpCurrency)?.value || "USD"
                  )}
                </div>
                <div className="ml-2 flex-1">
                  <TextField
                    style=""
                    id="bidValue"
                    field="bidValue"
                    value={requestData.bidValue ?? ""}
                    setValue={(value) =>
                      setRequestData((prev: any) => ({
                        ...prev,
                        bidValue: value,
                      }))
                    }
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>
              </div>
            </div> */}

            {/* Estimated Contract Value */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estimated Contract Value <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="border border-gray-300 rounded px-3 py-2 h-[34px] flex items-center bg-white text-sm">
                  {convertCurrencyLabel(
                    currencies.find((x) => x.value === requestData?.rfpCurrency)?.value || "USD"
                  )}
                </div>
                <div className="ml-2 flex-1">
                  <TextField
                    required={true}
                    style=""
                    id="estimatedContractValue"
                    field="estimatedContractValue"
                    value={requestData.estimatedContractValue ?? ""}
                    setValue={(value) =>
                      setRequestData((prev: any) => ({
                        ...prev,
                        estimatedContractValue: value,
                      }))
                    }
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {/* Is Tender Fee Applicable */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Is Tender Fee Applicable <span className="text-red-500">*</span>
              </label>
              <SelectField
                id="isTenderFeeApplicable"
                label=""
                style="w-full"
                value={
                  yesNoOptions.find((x) => x.value === requestData?.isTenderFeeApplicable)
                    ?.label as string
                }
                options={yesNoOptions.map((x) => ({
                  label: <span className="text-md font-medium">{x.label}</span>,
                  value: x.value,
                }))}
                onChange={(selectedValue) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    isTenderFeeApplicable: selectedValue,
                  }))
                }
              />
            </div>

            {/* Tender Fee */}
            {requestData?.isTenderFeeApplicable && <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tender Fee <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="border border-gray-300 rounded px-3 py-2 h-[34px] flex items-center bg-white text-sm">
                  {convertCurrencyLabel(
                    currencies.find((x) => x.value === requestData?.rfpCurrency)?.value || "USD"
                  )}
                </div>
                <div className="ml-2 flex-1">
                  <TextField
                    required={true}
                    style=""
                    id="tenderFee"
                    field="tenderFee"
                    value={requestData.tenderFee ?? ""}
                    setValue={(value) =>
                      setRequestData((prev: any) => ({
                        ...prev,
                        tenderFee: value,
                      }))
                    }
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RfpDetails;
