import { Button, notification } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import AddAttachment from "./AddAttachment";
import GeneralInformation from "./GeneralInformation";
import { getAllUsersByFilterAsync } from "../../../services/userService";
import { getAllDepartmentsAsync } from "../../../services/departmentService";
import { IRfp } from "../../../types/rfpTypes";
import RfpDetails from "./RfpDetails";
import { getAllCategoriesAsync } from "../../../services/categoryService";
import TimeLineOwnership from "./TimeLineOwnership";
import {
  createOrUpdateRfpAsync,
  getRfpByIdAsync,
} from "../../../services/rfpService";
import {
  fetchAndConvertToFile,
  getUserCredentials,
} from "../../../utils/common";
import { getAllCompaniesAsync } from "../../../services/companyService";
import CommonTitleCard from "../../basic_components/CommonTitleCard";
import RfpAttachments from "./RfpAttachments";
import ProcurementItems from "./ProcurementItems";
import { getAllDocumentTypesAsync } from "../../../services/commonService";
import { ClipboardMainIcon } from "../../../utils/Icons";
import { IBom } from "../../../types/bomTypes";
import { BOQRfpCreationHandoff } from "../../AdminVendorPortal/boq_intake/types";

type RfpType = "create" | "edit";

interface RfpRequestFormProps {
  type?: RfpType;
}

const defaultRfpState: IRfp = {
  id: 0,
  rfpTitle: "",
  rfpDescription: "",
  buyerName: getUserCredentials().name,
  buyer: [{ name: getUserCredentials().name, id: getUserCredentials().userId }],
  buyerOrganizationName: "",
  departmentId: Number(getUserCredentials().departmentId || "0"),
  isOpen: true,
  isSerial: false,
  rfpCurrency: "OMR",
  bidValue: undefined,
  hideContractValueFromVendor: false,
  estimatedContractValue: undefined,
  isTenderFeeApplicable: false,
  tenderFee: 0,
  categoryId: 0,
  purchaseRequisitionId: "",
  expressInterestLastDate: "",
  responseDueDate: "",
  buyerReplyEndDate: "",
  clarificationDate: "",
  closingDate: "",
  closingTime: "",
  rfpDocuments: [],
  rfpOwners: [],
  rfpCategories: [],
};

// Validation reference
const RfpValidationFields: Partial<Record<keyof IRfp, string>> = {
  rfpCategories: "Categories",
  buyer: "Buyer",
  expressInterestLastDate: "Express Interest Last Date",
};

function RfpRequestFormComponent({ type = "create" }: RfpRequestFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const boqHandoff = (location.state as { boqHandoff?: BOQRfpCreationHandoff } | null)?.boqHandoff;
  const { id } = useParams();
  const [requestData, setRequestData] = useState<IRfp>(defaultRfpState);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedBoms, setSelectedBoms] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<any>({
    users: [],
    departments: [],
    categories: [],
    companies: [],
    documentTypes: [],
  });

  const [procurementItems, setProcurementItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [owners, setOwners] = useState<{ technical: any[]; commercial: any[] }>(
    { technical: [], commercial: [] }
  );

  const OwnersValidationFields: Record<keyof typeof owners, string> = {
    technical: "Technical Owners",
    commercial: "Commercial Owners",
  };

  useEffect(() => {
    setupRfpFormAsync();
  }, []);

  const setupRfpFormAsync = async () => {
    try {
      const users = await getAllUsersByFilterAsync();
      const departments = await getAllDepartmentsAsync();
      const categories = await getAllCategoriesAsync();
      const companies = await getAllCompaniesAsync();
      const documentTypes = await getAllDocumentTypesAsync();
      setMasterData({
        users: (users as any)?.items,
        departments: departments.data,
        categories,
        companies,
        documentTypes,
      });
      if (id && !isNaN(Number(id))) {
        try {
          const rfpRequest = await getRfpByIdAsync(Number(id));
          setRequestData({
            ...rfpRequest,
            buyer: [
              {
                name: getUserCredentials().name,
                id: getUserCredentials().userId,
              },
            ],
            rfpDocuments: [],
          });

          const ownersTemp: any = { technical: [], commercial: [] };
          rfpRequest.rfpOwners.forEach((item: any) => {
            const user: any = (users as any)?.items.find(
              (u: any) => u.id == item.ownerId
            );
            if (user) {
              if (item.ownerType == 1) ownersTemp.technical.push(user);
              if (item.ownerType == 2) ownersTemp.commercial.push(user);
            }
          });
          setOwners(ownersTemp);
          setProcurementItems(rfpRequest.rfpItems || []);
          //  Load previously uploaded files
          const filesArray: any = [];
          for (let fileDetail of rfpRequest.rfpGeneralDocuments || []) {
            const { document, documentName } = await fetchAndConvertToFile(
              fileDetail?.filePath,
              fileDetail?.fileTitle //  This is the original name stored in DB
            );

            filesArray.push({
              name: documentName,
              type: fileDetail?.documentTypeId,
              attachment: document,
              previewPath: fileDetail?.filePath,
            });
          }

          setAttachments(filesArray);
          console.log(requestData, "RequestData");
          console.log(ownersTemp, "ownersTemp");
          console.log(attachments, "attachements");
          return;
        } catch (err) {
          console.error(err);
        }
      } else {
        const buyerOrganizationName = companies?.find(
          (x: any) => x?.id.toString() === getUserCredentials().companyId
        )?.companyName;
        setRequestData((prev) => ({
          ...prev,
          ...(boqHandoff?.requestData ?? {}),
          buyerOrganizationName,
          rfpCategories: boqHandoff ? boqHandoff.categoryIds.map((categoryId) => ({ categoryId, rfpId: 0 })) : prev.rfpCategories,
        }));
        if (boqHandoff) {
          setProcurementItems(boqHandoff.procurementItems);
          const documentType = documentTypes?.find((item: any) => {
            const name = String(item?.documentTypeName ?? "").toLowerCase();
            return name.includes("general") || name.includes("boq");
          }) ?? documentTypes?.[0];
          if (boqHandoff.sourceFile && documentType) {
            setAttachments([{ attachment: boqHandoff.sourceFile, type: documentType.id }]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log(requestData, "reg");
  }, [requestData]);

  const validateRfpFields = (data: IRfp) => {
    (Object.keys(RfpValidationFields) as (keyof IRfp)[]).forEach((key) => {
      const value = data[key];
      const label = RfpValidationFields[key];

      if (
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0) ||
        value === undefined ||
        value === null
      ) {
        alert(`Please fill the ${label}`);
        throw new Error("Validation failed");
      }
    });

    Object.entries(OwnersValidationFields).forEach(([key, label]) => {
      if (owners[key as keyof typeof owners].length === 0) {
        alert(`Please fill the ${label}`);
        throw new Error("Validation failed");
      }
    });

    // if (!procurementItems || procurementItems.length === 0) {
    //   alert("Please add at least one Procurement Item");
    //   throw new Error("Validation failed");
    // }

    if (!requestData?.departmentId) {
      alert("Please select department");
      throw new Error("Validation failed");
    }
    
    if (!attachments || attachments.length === 0) {
      alert("Please upload at least one Attachment");
      throw new Error("Validation failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validation
    validateRfpFields(requestData);
    console.log("Form submitted!", requestData);

    setIsLoading(true);
    // if (actionRef.current?.value == "next") {
    //   next();
    //   return;
    // }
    try {
      const formData = new FormData();
      const formDataTemp: Record<string, any> = { ...requestData, rfpItems: [] };
      formDataTemp.bidValue = Number(requestData.bidValue) || undefined;
      formDataTemp.estimatedContractValue = Number(
        requestData.estimatedContractValue
      );
      console.log(formDataTemp, "formDataTemp------------")
      for (var key in formDataTemp) {
        if (formDataTemp.hasOwnProperty(key)) {
          const value = formDataTemp[key];
          if (value != null) {
            if (key === "rfpDocuments") {
              let i = 0;
              // technicalAttachments.forEach((item) => {
              //   formData.append(`rfpDocuments[${i}].Document`, item.document);
              //   formData.append(`rfpDocuments[${i}].DocumentType`, "Technical");
              //   i++;
              // })
              console.log(attachments);
              attachments.forEach((item: any) => {
                formData.append(`rfpDocuments[${i}].Document`, item.attachment);
                formData.append(`rfpDocuments[${i}].DocumentTypeId`, item.type);
                i++;
              });
            } else if (key === "rfpOwners") {
              let i = 0;
              owners.technical.forEach((item: any) => {
                formData.append(`rfpOwners[${i}].ownerType`, "1");
                formData.append(`rfpOwners[${i}].ownerId`, item.id);
                formData.append(`rfpOwners[${i}].rfpId`, formDataTemp.id);
                i++;
              });
              owners.commercial.forEach((item: any) => {
                formData.append(`rfpOwners[${i}].ownerType`, "2");
                formData.append(`rfpOwners[${i}].ownerId`, item.id);
                formData.append(`rfpOwners[${i}].rfpId`, formDataTemp.id);
                i++;
                console.log(item, i, "commercial");
              });
            } else if (key == "buyer") continue;
            else if (key === "rfpCategories") {
              let i = 0;
              requestData.rfpCategories.forEach((item: any) => {
                formData.append(
                  `rfpCategories[${i}].categoryId`,
                  item.categoryId
                );
                formData.append(`rfpCategories[${i}].rfpId`, formDataTemp.id);
                i++;
              });
            } else if (key === "rfpItems") {
              let i = 0;
              procurementItems.forEach((item: any) => {
                formData.append(`rfpItems[${i}].id`, item?.id || "0");
                formData.append(`rfpItems[${i}].itemName`, item.itemName);
                formData.append(`rfpItems[${i}].itemCode`, item.itemCode);
                formData.append(`rfpItems[${i}].quantity`, item.quantity);
                formData.append(`rfpItems[${i}].rfpId`, formDataTemp.id);
                i++;
              });
              selectedBoms.forEach((item: IBom) => {
                item.bomItemDtos.forEach((item: any) => {
                  formData.append(`rfpItems[${i}].id`, item?.id || "0");
                  formData.append(`rfpItems[${i}].itemName`, item.itemName);
                  formData.append(`rfpItems[${i}].itemCode`, item.itemCode);
                  formData.append(`rfpItems[${i}].quantity`, item.quantity);
                  formData.append(`rfpItems[${i}].unit`, item?.unit || 0);
                  formData.append(`rfpItems[${i}].price`, item?.price || 0);
                  formData.append(`rfpItems[${i}].rfpId`, formDataTemp.id);
                  i++;
                });
              });
            } else {
              formData.append(key, value);
            }
          }
        }
      }

      if (selectedBoms.length > 0) {
        formData.append("bomId", selectedBoms[0]?.id);
      }

      const isCreatedOrUpdated = await createOrUpdateRfpAsync(formData);
      if (isCreatedOrUpdated) navigate(id ? `/rfps/${id}` : "/rfps");
    } catch (err) {
      console.log(err);
      notification.error({
        message: id ? "Unable to update RFP" : "Unable to create RFP",
        description: err instanceof Error ? err.message : "The RFP API request failed. Please review the form and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <CommonTitleCard />

      {/* Header Section */}
      <div className="admin-content pb-0">
        <div className="admin-page-header">
          <div className="admin-page-header-row">
            <div className="admin-title-cluster">
              <div className="admin-title-icon">
                <span className="text-white text-2xl font-bold">
                  <ClipboardMainIcon />
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {type === "create" ? "Create New RFP" : "Edit RFP"}
                </h1>
                <p className="text-gray-600 mt-2 text-sm">
                  {type === "create"
                    ? "Fill in the details below to create a new Request for Proposal"
                    : "Update the RFP information as needed"}
                </p>
              </div>
            </div>
            <div className="admin-title-actions">
              <div className="admin-count-badge">
                <span>
                  Step 1 of 5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {type === "create" && boqHandoff && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">BOQ data loaded from {boqHandoff.sourceDocumentName}</div>
                <div className="mt-1 text-xs text-emerald-700">
                  {boqHandoff.procurementItems.length} products ready: {boqHandoff.productsReused} matched in the product master and {boqHandoff.productsCreated} created through the product API.
                </div>
              </div>
              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                {boqHandoff.sourceFile ? "Source PDF attached" : "Source PDF must be reattached"}
              </span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress Steps */}
          {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    General Info
                  </span>
                </div>
                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    RFP Details
                  </span>
                </div>
                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Timeline & Ownership
                  </span>
                </div>
                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-blue-700 text-sm font-bold">4</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    Pharmacy Products
                  </span>
                </div>
                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-gray-600 text-sm font-bold">5</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">
                    Attachments
                  </span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Form Sections */}
          <div className="space-y-8">
            <GeneralInformation
              masterData={masterData}
              setRequestData={setRequestData}
              requestData={requestData}
            />
            <RfpDetails
              masterData={masterData}
              setRequestData={setRequestData}
              requestData={requestData}
            />
            <TimeLineOwnership
              masterData={masterData}
              setRequestData={setRequestData}
              requestData={requestData}
              owners={owners}
              setOwners={setOwners}
            />
            <ProcurementItems
              selectedBoms={selectedBoms}
              setSelectedBoms={setSelectedBoms}
              items={procurementItems}
              setItems={setProcurementItems}
            />
            <RfpAttachments
              attachments={attachments}
              setAttachments={setAttachments}
              setAttachmentsToDelete={() => { }}
              documentTypes={masterData.documentTypes}
            />
          </div>

          {/* Form Actions */}
          <div className="mt-8 app-surface p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">
                      {type === "create" ? "Creating new RFP" : "Updating RFP"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(procurementItems || []).length} products •{" "}
                      {(attachments || []).length} attachments
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => {
                    navigate(id ? `/rfps/${id}` : "/rfps");
                  }}
                  className="px-8 py-3 h-auto border-slate-200 text-slate-700 hover:bg-violet-50 hover:text-violet-800 transition-all duration-200 font-semibold"
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    console.log("Button clicked!");
                    // Let the form's onSubmit handle the submission
                  }}
                  className="px-10 py-3 h-auto bg-violet-700 hover:bg-violet-800 text-white font-semibold shadow-[0_10px_22px_rgba(109,40,217,0.22)] transition-all duration-200"
                  loading={isLoading}
                  size="large"
                >
                  {id ? "Update RFP" : "Send for Approval"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}

export default RfpRequestFormComponent;
