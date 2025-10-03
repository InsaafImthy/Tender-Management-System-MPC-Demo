import React, { SetStateAction, useEffect } from "react";
import { IRfp } from "../../../types/rfpTypes";
import PeoplePicker from "../../basic_components/PeoplePicker";
import 'react-datepicker/dist/react-datepicker.css';
import DateTimePicker from "../../basic_components/date_time_picker/DateTimePicker";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface TimeLineOwnershipProps {
  requestData: any;
  setRequestData: React.Dispatch<SetStateAction<any>>;
  masterData: any;
  owners: any;
  setOwners: React.Dispatch<SetStateAction<any>>;
}

const TimeLineOwnership: React.FC<TimeLineOwnershipProps> = ({
  requestData,
  setRequestData,
  masterData,
  owners,
  setOwners,
}) => {
  useEffect(() => {
    console.log(owners);
  }, [owners]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Timeline & Ownership</h2>
            <p className="text-gray-600 mt-1">Set important dates and assign ownership</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <DateTimePicker
                required={true}
                value={requestData.expressInterestLastDate || null}
                label="Express Interest Last Date"
                format="DD-MM-YYYY hh:mm A"
                id="expressInterestLastDate"
                setValue={(val) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    expressInterestLastDate: val,
                  }))
                }
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Clarification End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                required={true}
                value={requestData.clarificationDate ? dayjs(requestData.clarificationDate) : null}
                id="clarificationDate"
                className="w-full h-[41px]"
                format="DD-MM-YYYY"
                onChange={(value) =>
                  setRequestData((prev: IRfp) => ({
                    ...prev,
                    clarificationDate: value ? value.toISOString() : null,
                  }))
                }
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Publish Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                required={true}
                value={requestData.publishDate ? dayjs(requestData.publishDate) : null}
                id="buyerReplyEndDate"
                className="w-full h-[41px]"
                format="DD-MM-YYYY"
                onChange={(value) =>
                  setRequestData((prev: IRfp) => ({
                    ...prev,
                    publishDate: value ? value.toISOString() : null,
                  }))
                }
              />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <DateTimePicker
                required={true}
                label="Closing Date & Time"
                format="DD-MM-YYYY hh:mm A"
                value={requestData.closingDate || null}
                setValue={(val) =>
                  setRequestData((prev: any) => ({
                    ...prev,
                    closingDate: val,
                  }))
                }
              />
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Technical Owners <span className="text-red-500">*</span></label>
              <PeoplePicker
                setValue={(value: any) =>
                  setOwners((prev: IRfp) => ({ ...prev, technical: value }))
                }
                users={masterData?.users}
                value={owners.technical}
                placeholder="search.."
              />
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Commercial Owners <span className="text-red-500">*</span></label>
              <PeoplePicker
                setValue={(value: any) =>
                  setOwners((prev: IRfp) => ({ ...prev, commercial: value }))
                }
                users={masterData?.users}
                value={owners.commercial}
                placeholder="search.."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeLineOwnership;
