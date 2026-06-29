// ApprovalWorkflow.tsx
import React, { SetStateAction, useEffect, useState } from "react";
import { IRfp } from "../../../types/rfpTypes";
import Table from "../../basic_components/Table";
import { IFilterDto } from "../../../types/commonTypes";
import Modal from "../../basic_components/Modal";
import ProposalSubmissionModal from "./ProposalSubmissionModal";
import {
  getAllEvaluationReportsAsync,
  getAllProposalsByFilterAsync,
  getAllRfpIntrestByFilterAsync,
  getAllRfpLiveBiddingVendorsAsync,
  getProposalByIdAsync,
  uploadEvaluationReportAsync,
} from "../../../services/rfpService";
import ClarificationList from "./ClarificationList";
import {
  DocumentIconByExtension,
  IntrestedIcon,
  OpenMainIcon,
} from "../../../utils/Icons";
import { Button, notification } from "antd";
import { getUserCredentials } from "../../../utils/common";
import { documentTypeConst } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { RfpData } from "../../../pages/live_bidding_page/LiveBiddingPage";
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface IRfpDetailRight {
  rfp: IRfp;
  trigger: () => void;
  vendorProposals: any[];
  setVendorProposals: React.Dispatch<SetStateAction<any[]>>;
}

const ItemCountCard: React.FC<{
  item: { icon?: any; label: string; bgColor: string; count: number | string | any };
  className?: string;
}> = ({ item, className }) => {
  return (
    <div
      className={`w-full h-[64px] border border-gray-200 rounded-xl shadow-sm flex justify-between items-center px-[21px] ${className}`}
    >
      <div className="flex items-center">
        {item?.icon && (
          <div
            className="w-[32px] h-[32px] rounded-full mr-3 flex justify-center items-center"
            style={{ backgroundColor: item.bgColor }}
          >
            {item?.icon}
          </div>)}

        <span className="text-sm font-semibold text-black">{item.label}</span>
      </div>
      <span className="text-xl font-bold text-[#0B1F49]">{item.count}</span>
    </div>
  );
};

const RfpDetailRight: React.FC<IRfpDetailRight> = ({
  rfp,
  trigger,
  vendorProposals,
  setVendorProposals,
}) => {
  const [isModalOpenItem, setIsModalOpenItem] = useState<any>(null);
  // const [vendorProposals, setVendorProposals] = useState<any[]>([]);
  const [vendorIntrestCount, setVendorIntrestCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Proposals");
  const [evaluationDocuments, setEvaluationDocuments] = useState<any>([]);
  const [liveBiddingVendors, setLiveBiddingVendors] = useState<any[]>([])
  const [ownerIn, setOwnerIn] = useState<{
    technical: boolean;
    commercial: boolean;
  }>({
    technical: false,
    commercial: false,
  });
  const navigate = useNavigate();
  const [rfpData,] = useState<RfpData | null>(rfp as any);
  // const { id } = useParams<{ id: string }>();

  // const fetchRfpData = async () => {
  //   try {
  //     const rfp = await getRfpByIdAsync(Number(id));
  //     setRfpData(rfp);
  //   } catch (error) {
  //     console.error("Error fetching RFP data:", error);
  //     notification.error({
  //       message: "Error",
  //       description: "Failed to fetch RFP details",
  //     });
  //   }
  // };

  // useEffect(() => {
  //   const loadData = async () => {
  //     if (id) {
  //       await Promise.all([fetchRfpData()]);
  //     }
  //   };
  //   loadData();
  // }, [id]);

  const fetchVendorsListAsync = async () => {
    try {
      var vendorsList = await getAllRfpLiveBiddingVendorsAsync(rfp.id ?? 0);
      setLiveBiddingVendors(vendorsList);
    } catch (err) {

    }
  }

  useEffect(() => {
    const tempOwnerIn = { technical: false, commercial: false };

    (rfp?.rfpOwners as any[])?.forEach((ow) => {
      if (
        ow.ownerId.toString() === getUserCredentials().userId &&
        ow.ownerType === documentTypeConst.technical
      ) {
        tempOwnerIn.technical = true;
      } else if (
        ow.ownerId.toString() === getUserCredentials().userId &&
        ow.ownerType === documentTypeConst.commercial
      ) {
        tempOwnerIn.commercial = true;
      }
    });

    setOwnerIn(tempOwnerIn);
    if (rfp?.rfpType) {
      fetchVendorsListAsync();
    }
  }, [rfp]);

  const maskedProposals = vendorProposals.map((p) => ({
    ...p,
    bidAmount:
      ownerIn.commercial ||
        rfp?.createdBy?.toString() == getUserCredentials().userId
        ? p.bidAmount
        : "*******",
    bidValidity:
      ownerIn.commercial ||
        rfp?.createdBy?.toString() == getUserCredentials().userId
        ? p.bidValidity
        : "*******",
  }));

  const tabs = ["Proposals", "Clarifications"];

  const handleProposalFilter = async (filterDto: IFilterDto = filter) => {
    try {
      if (activeTab == "Proposals") {
        const filtered_proposals = await getAllProposalsByFilterAsync(
          filterDto
        );
        setVendorProposals(filtered_proposals);
      }
    } catch (err) { }
  };

  const setupTabsAsync = async () => {
    try {
      if (activeTab == "Proposals") {
        const intrestOnRfp = await getAllRfpIntrestByFilterAsync({
          fields: [
            {
              columnName: "RfpId",
              value: rfp?.id ?? 0,
            },
          ],
        });
        setVendorIntrestCount(intrestOnRfp.length);
        if (rfp?.status != 5) {
          const evaluationReports = await getAllEvaluationReportsAsync(
            Number(rfp?.id || "0")
          );
          const evalutionDocumentMapped = evaluationReports.map((d: any) => ({
            documentUrl: d.filePath,
            documentName: d.fileTitle,
          }));
          setEvaluationDocuments(evalutionDocumentMapped);
        }
      } else if (activeTab == "Clarifications") {
      }
      trigger && trigger();
    } catch (err) { }
  };

  useEffect(() => {
    handleProposalFilter({ ...filter, globalSearch: searchQuery });
  }, [searchQuery]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files ? event.target.files[0] : null;
    if (selectedFiles) {
      setEvaluationDocuments([
        {
          document: selectedFiles,
          documentName: selectedFiles.name,
          documentUrl: URL.createObjectURL(selectedFiles),
        },
      ]);
      const formData = new FormData();
      formData.append("rfpId", rfp?.id?.toString() ?? "0");
      formData.append("file", selectedFiles);
      await uploadEvaluationReportAsync(formData);
      notification.success({
        message: "document uploaded successfully",
      });
    }
  };

  useEffect(() => {
    setupTabsAsync();
    console.log(searchQuery);
  }, [activeTab, searchQuery]);

  const [filter, setFilter] = useState<IFilterDto>({
    fields: [{ columnName: "RfpId", value: rfp?.id ?? 0 }],
    globalSearch: "",
    sortColumn: "CreatedAt",
    sortDirection: "DESC",
  });
  const proposalTableColumns = [
    "vendorCode",
    "vendorName",
    "bidAmount",
    "bidValidity",
  ];
  const columnLabels = {
    vendorCode: "ID",
    vendorName: "Vendor Name",
    bidAmount: "Bid Amount",
    bidValidity: "Bid Validity",
  };

  return (
    <>
      <div className="h-full w-full bg-white">
        {!rfp?.rfpType ? (
          <div className="mx-auto flex h-full w-full flex-col space-y-4">
            <div className="sticky top-0 z-10 -mx-1 bg-white/95 px-1 backdrop-blur">
              <div className="overflow-x-auto scroll-smooth no-scrollbar">
                <div className="flex min-w-max justify-start gap-6 border-b border-slate-200 pt-2">
                  {tabs.map((tab, index) => (
                    <div className="flex h-[42px] items-center" key={tab}>
                      <div
                        onClick={() => setActiveTab(tab)}
                        className={`relative flex h-full items-center text-sm text-start cursor-pointer font-semibold ${activeTab === tab
                          ? "text-customBlue"
                          : "text-gray-500 hover:text-black"
                          }`}
                      >
                        {tab}
                        <span
                          className={`absolute bottom-0 left-0 w-full h-[3px] ${activeTab === tab
                            ? "bg-customBlue"
                            : "bg-transparent group-hover:bg-customeBlue"
                            }`}
                        ></span>
                      </div>
                      {index !== tabs.length - 1 && (
                        <span className="h-[37px] text-gray-400"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full">
              {activeTab === "Proposals" && (
                <>
                  {rfp?.status == 5 ? (
                    <>
                      <ItemCountCard
                        className="mb-[16px]"
                        item={{
                          icon: (
                            <OpenMainIcon className="w-[16px] h-[16px] text-white" />
                          ),
                          bgColor: "#314DA0",
                          count: vendorProposals?.length || 0,
                          label: "Total Proposals Received",
                        }}
                      />
                      <ItemCountCard
                        item={{
                          icon: (
                            <IntrestedIcon className="w-[16px] h-[16px] text-white" />
                          ),
                          bgColor: "#BFDC1A",
                          count: vendorIntrestCount,
                          label: "Total Interest Submitted",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className="mb-[16px] flex flex-col rounded-2xl border border-[#D4E5FB] bg-[#EDF4FD] p-4 text-sm"
                      >
                        <div className="group relative">
                          <span className="font-bold text-[16px] mb-[17.5px] flex">
                            <span>Evaluation Report</span>
                          </span>
                          <div className="flex flex-col">
                            {evaluationDocuments.map((d: any) => (
                              <span key={d.documentName}>
                                <a
                                  className="text-[13px] flex items-end mb-5"
                                  href={
                                    d.documentUrl ? d.documentUrl : d.document
                                  }
                                  target="blank"
                                  download={d.documentName}
                                >
                                  <DocumentIconByExtension
                                    className="w-[25px] h-[25px]"
                                    filePath={d.documentUrl}
                                  />
                                  <p
                                    className="pl-[4px]"
                                    style={{
                                      color: "blue",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {d.documentName}
                                  </p>
                                </a>
                                {rfp?.status != 6 && (
                                  <label htmlFor="upload-eval-file">
                                    <span className="inline-flex rounded-md border bg-white px-3 py-2">
                                      Reupload
                                    </span>
                                  </label>
                                )}
                              </span>
                            ))}
                          </div>
                          {evaluationDocuments.length == 0 && (
                            <label htmlFor="upload-eval-file">
                              <span className="text-gray-500 hover:underline cursor-pointer text-sm font-regular mb-1">
                                Drag and drop your files here or
                              </span>{" "}
                              <span className="text-blue-600 hover:underline cursor-pointer text-sm font-medium mb-1">
                                browse
                              </span>
                            </label>
                          )}
                          <input
                            type="file"
                            id="upload-eval-file"
                            accept=".pdf,.docx,.jpg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200">
                        <Table
                          columnLabels={columnLabels}
                          items={maskedProposals}
                          columns={proposalTableColumns}
                          title="Proposals"
                          type="proposal"
                          setIsModalOpenItem={async (val) => {
                            const proposalTemp = await getProposalByIdAsync(
                              val?.id
                            );
                            setIsModalOpenItem(proposalTemp);
                          }}
                          filter={filter}
                          setFilter={setFilter}
                          setSearchQuery={setSearchQuery}
                          totalCount={10}
                          IsIcon={false}
                          subtitle=""
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              {activeTab === "Clarifications" && (
                <div>
                  <ClarificationList rfpId={rfp?.id as number} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full bg-white p-2 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-gray-900 mt-1">
                Live Bidding
              </h1>
              <Button
                onClick={() => navigate(`/rfps/${rfp?.id}/live-bidding`)}
                className="flex items-center gap-2"
              >
                View Full Details
                <ArrowRightOutlined />
              </Button>
            </div>
            <div className="mt-8 w-full">
              <ItemCountCard
                className="mb-[16px]"
                item={{
                  bgColor: "#314DA0",
                  count: rfpData?.estimatedContractValue || 0,
                  label: "Estimated Contract Value",
                }}
              />
              <ItemCountCard
                className="mb-[16px]"
                item={{
                  bgColor: "#314DA0",
                  count: rfpData?.liveBiddingEndDateTime
                    ? <p className="text-sm">{dayjs(rfpData.liveBiddingEndDateTime).format("DD MMM, YYYY hh:mm A")}</p>
                    : "N/A",
                  label: "Closing Date & Time",
                }}
              />
              <div>

                <span className="text-sm font-semibold text-black mb-2">Participating Vendors:</span>
                <div className="flex flex-col">
                  {liveBiddingVendors.map(x => (<div className="text-sm text-[#0B1F49]">{x?.vendor?.organisationName}</div>))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div >
      <Modal
        content={
          <ProposalSubmissionModal
            rfp={rfp}
            proposal={isModalOpenItem}
            trigger={() => {
              setIsModalOpenItem(null);
              trigger();
            }}
          />
        }
        isOpen={isModalOpenItem}
        onClose={() => setIsModalOpenItem(null)}
        modalPosition="end"
        width="w-full md:w-2/5"
      />
    </>
  );
};

export default RfpDetailRight;
