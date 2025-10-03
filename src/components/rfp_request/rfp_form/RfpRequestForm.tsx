import { Button } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  rfpCurrency: "USD",
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
  const { id } = useParams();
  const [requestData, setRequestData] = useState<IRfp>(defaultRfpState);
  const [attachments, setAttachments] = useState<any[]>([]);
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
        setRequestData((prev) => ({
          ...prev,
          buyerOrganizationName: companies?.find(
            (x: any) => x?.id.toString() === getUserCredentials().companyId
          )?.companyName,
        }));
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

    if (!procurementItems || procurementItems.length === 0) {
      alert("Please add at least one Procurement Item");
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
      const formDataTemp: Record<string, any> = requestData;
      formDataTemp.bidValue = Number(requestData.bidValue) || undefined;
      formDataTemp.estimatedContractValue = Number(
        requestData.estimatedContractValue
      );
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
            } else {
              formData.append(key, value);
            }
          }
        }
      }

      const isCreatedOrUpdated = await createOrUpdateRfpAsync(formData);
      if (isCreatedOrUpdated) navigate(id ? `/rfps/${id}` : "/rfps");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CommonTitleCard />

      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-[#1365AA] rounded-2xl flex items-center justify-center shadow-lg">
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
            <div className="flex items-center space-x-3">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">
                  Step 1 of 5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
                    Procurement Items
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
              items={procurementItems}
              setItems={setProcurementItems}
            />
            <RfpAttachments
              attachments={attachments}
              setAttachments={setAttachments}
              setAttachmentsToDelete={() => {}}
              documentTypes={masterData.documentTypes}
            />
          </div>

          {/* Form Actions */}
          <div className="mt-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">
                      {type === "create" ? "Creating new RFP" : "Updating RFP"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(procurementItems || []).length} items •{" "}
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
                  className="px-8 py-3 h-auto border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
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
                  className="px-10 py-3 h-auto bg-gradient-to-r from-blue-400 to-[#1365AA] hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
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
