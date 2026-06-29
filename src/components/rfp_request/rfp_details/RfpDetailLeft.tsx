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
    } catch (err) { }
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
    } catch (err) { }
  };

  const onEditRequest = async () => {
    try {
      navigate(`/rfps/edit-rfp/${id}`);
    } catch (error) { }
  };

  useEffect(() => {
    setupOwners();
    setDocuments();
  }, [requestData]);

  return (
    <div className="space-y-4">
      {requestData && (
        <div className="w-full bg-white">
          {/* Header Section */}
          <div className="w-full border-b border-slate-200 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-[#1365AA] shadow-[0_14px_28px_rgba(19,101,170,0.18)]">
                    <span className="text-white text-sm"><ClipboardIcon /></span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                      {requestData.rfpTitle}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        ID: {requestData?.tenderNumber || "-"}
                      </span>
                      <button
                        onClick={onEditRequest}
                        className="inline-flex items-center rounded-full border border-violet-200 px-3 py-1 text-xs font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                      >
                        <PenIcon className="mr-1 inline h-3 w-3" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {requestData?.isLiveBiddingOn && <div onClick={() => navigate(`/rfps/${requestData?.id}/live-bidding`)} className="inline-flex cursor-pointer items-center self-start rounded-full border border-red-100 bg-red-50 px-3 py-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="ml-2 text-sm font-semibold text-red-600">Live</span>
              </div>}
                </div>
          </div>

          {/* Content */}
          <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h3>
              <p className="max-w-4xl text-sm leading-7 text-gray-600">
                {requestData.rfpDescription}
              </p>
            </div>

            {/* RFP Products */}
            <div>
              <ViewTable
                columns={["itemCode", "itemName", "quantity"]}
                columnLabels={{
                  itemCode: "Product Code",
                  itemName: "Medicine/Supply Name",
                  quantity: "Quantity",
                }}
                items={requestData?.rfpItems}
              />
            </div>

            {/* General Details */}
            <div>
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
              <div className="mb-4 rounded-2xl bg-slate-50 p-4">
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
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-gray-500 mb-1">Closed / Open</p>
                  <p className="text-sm font-medium text-gray-900">
                    {requestData?.isOpen ? "Open" : "Closed"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
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
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-gray-500">Bid Value</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {convertCurrencyLabel(requestData?.rfpCurrency)}
                        {requestData?.bidValue}
                      </span>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <GeneralDetailIcon className="w-4 h-4 mr-2" /> RFP Details
              </h3>

              {/* Buyer Information */}
              <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-gray-500">Closing Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dayjs(requestData?.closingDate).format("DD-MM-YYYY")}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-gray-500">Closing Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dayjs(requestData?.closingDate).format("hh:mm A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership Details */}
            <div>
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
                      <div key={idx} className="flex items-center rounded-full bg-blue-100 px-3 py-1.5">
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
                      <div key={idx} className="flex items-center rounded-full bg-green-100 px-3 py-1.5">
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
                  <div className="rounded-2xl bg-slate-50 p-3">
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
      )
      }
    </div >
  );
};

export default RfpDetailLeft;
