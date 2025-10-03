import React, { useEffect, useState } from "react";
import {
  DocumentIconByExtension,
  GeneralDetailIcon,
} from "../../../utils/Icons";
import { convertCurrencyLabel, getKeyByValue } from "../../../utils/common";
import ShowStatus from "../../buttons/ShowStatus";
import dayjs from "dayjs";
import userPhoto from "../../../assets/profile_photo/userPhoto.png";
import { getAllUsersByFilterAsync } from "../../../services/userService";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardIcon, PenIcon } from "lucide-react";
import ViewTable from "../../basic_components/ViewTable";
import { documentTypeConst } from "../../../utils/constants";

interface RfpDetailLeftProp {
  masterData: any;
  requestData: any | undefined;
  trigger: () => void;
}

type KeyValueProps = {
  data: {
    label: string;
    value: React.ReactNode;
  }[];
  className: string;
};

export const KeyValueGrid: React.FC<KeyValueProps> = ({ data, className }) => {
  return (
    <div className={`grid grid-cols-2 gap-y-[16px] ${className}`}>
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col">
          <span className="text-[12px] text-gray-500 mb-[4px]">
            {item.label}
          </span>
          <span className="text-[14px] text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

type UserBadge = {
  name: string;
  avatarUrl: string;
};

type UserBadgesProps = {
  title: string;
  users: UserBadge[];
};

export const UserBadges: React.FC<UserBadgesProps> = ({ title, users }) => {
  return (
    <div className="flex flex-col mb-[16px]">
      <span className="text-[14px] text-gray-500 mb-[8px]">{title}</span>
      <div className="flex items-center gap-[8px]">
        {users.map((user, idx) => (
          <div
            key={idx}
            className="flex items-center bg-[#EBEEF4] rounded-full py-1 px-1"
          >
            <img
              src={user.avatarUrl || userPhoto}
              alt={user.name}
              className="w-[24px] h-[24px] rounded-full mr-[8px]"
            />
            <span className="text-[14px] text-gray-800">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RfpDetailLeft: React.FC<RfpDetailLeftProp> = ({
  masterData,
  requestData,
}: RfpDetailLeftProp) => {
  const [rfpDocuments, setRfpDocuments] = useState<any[]>([]);
  const [owners, setOwners] = useState<{ technical: any[]; commercial: any[] }>(
    { technical: [], commercial: [] }
  );
  const navigate = useNavigate();
  const { id } = useParams();

  const setupOwners = async () => {
    try {
      if (requestData) {
        const users: any = await getAllUsersByFilterAsync();
        const tempOwners: { technical: any[]; commercial: any[] } = {
          technical: [],
          commercial: [],
        };
        requestData?.rfpOwners.forEach((ow: any) => {
          const userExist: any = users.items.find(
            (u: any) => u.id == ow.ownerId
          );
          if (userExist) {
            switch (ow.ownerType) {
              case 1: {
                tempOwners.technical.push({
                  name: userExist.name,
                  avatarUrl: userExist?.photo ?? userPhoto,
                });
                break; // Add break to prevent fallthrough
              }
              case 2: {
                tempOwners.commercial.push({
                  name: userExist.name,
                  avatarUrl: userExist?.photo ?? userPhoto,
                });
                break; // Add break to prevent fallthrough
              }
              default: {
                // No action needed, or handle default case if necessary
              }
            }
          }
        });
        setOwners(tempOwners);
      }
    } catch (err) {}
  };

  const setDocuments = async () => {
    try {
      if (requestData) {
        const documents_to_display = requestData.rfpGeneralDocuments.map(
          (d: any) => ({
            ...d,
            type: getKeyByValue(documentTypeConst, d.documentTypeId),
            attachmentComponent: (
              <a
                className="text-[13px] flex items-end"
                href={d.filePath}
                download={d.fileTitle}
              >
                <DocumentIconByExtension
                  className="w-[25px] h-[25px]"
                  filePath={d.filePath}
                />
                <p
                  className="pl-[4px]"
                  style={{ color: "blue", textDecoration: "underline" }}
                >
                  {d.fileTitle}
                </p>
              </a>
            ),
          })
        );
        setRfpDocuments(documents_to_display);
      }
    } catch (err) {}
  };

  const onEditRequest = async () => {
    try {
      navigate(`/rfps/edit-rfp/${id}`);
    } catch (error) {}
  };

  useEffect(() => {
    setupOwners();
    setDocuments();
  }, [requestData]);

  return (
    <div className="space-y-4">
      {requestData && (
        <div className="bg-white w-full border border-gray-200">
          {/* Header Section */}
          <div className="px-6 py-4 border-b w-full border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm"><ClipboardIcon/></span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {requestData.rfpTitle}
                    </h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        ID: {requestData?.tenderNumber || "-"}
                      </span>
                      <button
                        onClick={onEditRequest}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <PenIcon className="w-3 h-3 inline mr-1" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {requestData.rfpDescription}
              </p>
            </div>

            {/* Rfp Items */}
            <div className="mb-6">
              <ViewTable
                columns={["itemCode", "itemName", "quantity"]}
                columnLabels={{
                  itemCode: "Id",
                  itemName: "Item",
                  quantity: "Quantity",
                }}
                items={requestData?.rfpItems}
              />
            </div>

            {/* General Details */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <GeneralDetailIcon className="w-4 h-4 mr-2" /> General Details
              </h3>

              {/* Published Categories */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Published Categories
                </h4>
                {masterData?.categories?.length > 0 &&
                requestData?.rfpCategories?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {requestData?.rfpCategories?.map((item: any) => {
                      const category = masterData?.categories?.find(
                        (c: any) => c.id === item.categoryId
                      );
                      return (
                        <span
                          key={item.categoryId}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {category?.name || "Unknown"}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    No categories assigned
                  </p>
                )}
              </div>

              {/* Status and Requisition ID */}
              <div className="bg-gray-50 rounded p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Purchase Requisition ID
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {requestData?.purchaseRequisitionId || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">RFP Status</p>
                    <ShowStatus type="rfps" status={requestData?.status} />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Closed / Open</p>
                  <p className="text-sm font-medium text-gray-900">
                    {requestData?.isOpen ? "Open" : "Closed"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Serial / Parallel
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {requestData?.isSerial ? "Serial" : "Parallel"}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Estimated Contract Value
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {convertCurrencyLabel(requestData?.rfpCurrency)}
                      {requestData?.estimatedContractValue}
                    </span>
                  </div>
                </div>
                {requestData?.bidValue && (
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Bid Value</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {convertCurrencyLabel(requestData?.rfpCurrency)}
                        {requestData?.bidValue}
                      </span>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Tender Fee</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {convertCurrencyLabel(requestData?.rfpCurrency)}
                      {requestData?.tenderFee}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RFP Details */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <GeneralDetailIcon className="w-4 h-4 mr-2" /> RFP Details
              </h3>

              {/* Buyer Information */}
              <div className="bg-gray-50 rounded p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Buyer Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {requestData?.buyerName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="text-sm font-medium text-gray-900">
                      {requestData?.departmentName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Organization</p>
                    <p className="text-sm font-medium text-gray-900">
                      {requestData?.buyerOrganizationName || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Express Interest Last Date
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {dayjs(requestData?.expressInterestLastDate).format(
                        "DD-MM-YYYY"
                      )}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Clarification Date
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {dayjs(requestData?.clarificationDate).format(
                        "DD-MM-YYYY"
                      )}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Closing Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dayjs(requestData?.closingDate).format("DD-MM-YYYY")}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Closing Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dayjs(requestData?.closingDate).format("hh:mm A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership Details */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <GeneralDetailIcon className="w-4 h-4 mr-2" /> Ownership
              </h3>

              {/* Technical Owners */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Technical Owners
                </h4>
                {owners.technical.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {owners.technical.map((user, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-blue-100 rounded px-3 py-1"
                      >
                        <img
                          src={user.avatarUrl || userPhoto}
                          alt={user.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-xs font-medium text-gray-800">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    No technical owners assigned
                  </p>
                )}
              </div>

              {/* Commercial Owners */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Commercial Owners
                </h4>
                {owners.commercial.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {owners.commercial.map((user, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-green-100 rounded px-3 py-1"
                      >
                        <img
                          src={user.avatarUrl || userPhoto}
                          alt={user.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-xs font-medium text-gray-800">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    No commercial owners assigned
                  </p>
                )}
              </div>

              {/* Supporting Documents */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Supporting Documents
                </h4>
                {rfpDocuments.length > 0 ? (
                  <div className="bg-gray-50 rounded p-3">
                    <ViewTable
                      columns={["attachmentComponent", "type"]}
                      columnLabels={{
                        attachmentComponent: "Attachment",
                        type: "Type",
                      }}
                      items={rfpDocuments}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    No supporting documents
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfpDetailLeft;
