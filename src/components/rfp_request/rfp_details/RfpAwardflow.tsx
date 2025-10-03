// ApprovalWorkflow.tsx
import React, { useEffect, useState } from "react";
// import { getApprovalFlowById } from '../../services/flowService';
// import { getAllUsersByFilterAsync } from '../../services/userService';
// import { ApprovalStep } from '../../types/approvalTypes';
// import { handleFile } from '../../utils/common';
// import userPhoto from "../../../assets/profile_photo/userPhoto.png"
// import { IStep } from '../../../types/approvalflowTypes';
import { getRpfApprovalFlowsByIdAsync } from "../../../services/flowService";
import { getUserCredentials } from "../../../utils/common";
import StepIndicator from "./rfp_approve-reject_right_component/StepIndicator";
import StepCard from "./rfp_approve-reject_right_component/StepCard";
import {
  DocumentIconByExtension,
  GeneralDetailIcon,
} from "../../../utils/Icons";
import {
  getAllEvaluationReportsAsync,
  getAllSelectedProposalsByRfpIdAsync,
  getRfpDecisionPaperByRfpIdAsync,
  sendFinalBidRequestAsync,
} from "../../../services/rfpService";
import Modal from "../../basic_components/Modal";
import RfpDecisionForm from "../../../pages/rfp_decision_form/RfpDecisionForm";
import { Button, Select } from "antd";
import ViewTable from "../../basic_components/ViewTable";

interface IRfpDetailRight {
  rfpDetails: any;
  trigger: () => void;
}

// Collapsible Bid Split section under Vendor Proposals
const BidSplitSection: React.FC<{ proposals: any[] }> = ({ proposals }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="w-full">
      <button
        type="button"
        className="text-blue-600 text-sm underline"
        onClick={() => setExpanded((x) => !x)}
      >
        {expanded ? "Hide details" : "View more info"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          {proposals.map((p: any) => (
            <div key={p.id} className="space-y-2">
              <span className="font-bold text-sm flex">
                <span>
                  Bid split - {p.vendorName || `Vendor #${p.vendorId}`}
                </span>
              </span>
              <ViewTable
                columns={["itemCode", "itemName", "quantity", "amount"]}
                columnLabels={{
                  itemCode: "Item Code",
                  itemName: "Item Name",
                  quantity: "Qty",
                  amount: "Amount",
                }}
                items={(p.vendorRfpProposalItems || []).map((it: any) => ({
                  id: it.id,
                  itemCode: it.rfpItem?.itemCode,
                  itemName: it.rfpItem?.itemName,
                  quantity: it.rfpItem?.quantity,
                  amount: it.amount,
                }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RfpAwardflow: React.FC<IRfpDetailRight> = ({ rfpDetails, trigger }) => {
  const [stepsList, setStepsList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [decissionPaper, setDecissionPaper] = useState<any>({
    vendorRfpProposalId: 0,
  });
  const [evaluationDocuments, setEvaluationDocuments] = useState<any>([]);
  const [selectedProposals, setSelectedProposals] = useState<any[]>([]);
  const [enableSelect, setEnableSelect] = useState<boolean>(false);
  const [hasDecisionPaper, setHasDecisionPaper] = useState<boolean>(false);

  const setupRfpProposalApproveReject = async () => {
    try {
      const response: any[] = await getRpfApprovalFlowsByIdAsync(
        rfpDetails?.id,
        "rfpaward"
      );
      const formatedSteps = response.map((item: any, i) => ({
        ...item,
        current:
          getUserCredentials().userId == item.approverId &&
          (i == 0 || response[i - 1].status == 1),
        status:
          item.status == 0
            ? "pending"
            : item.status == 1
              ? "approved"
              : "rejected",
        photo: item.photo || "", // Add photo property with default empty string
      }));
      setStepsList(formatedSteps);
      if (
        rfpDetails?.status == 9 ||
        rfpDetails?.status == 10 ||
        rfpDetails?.status == 6
      ) {
        const evaluationReports = await getAllEvaluationReportsAsync(
          Number(rfpDetails?.id || "0")
        );
        const evalutionDocumentMapped = evaluationReports.map((d: any) => ({
          documentUrl: d.filePath,
          documentName: d.fileTitle,
        }));
        setEvaluationDocuments(evalutionDocumentMapped);
        const selectedProposalsList = await getAllSelectedProposalsByRfpIdAsync(
          rfpDetails?.id || 0
        );
        console.log(
          selectedProposalsList,
          "selectedProposalsList--------------selectedProposalsList"
        );
        setSelectedProposals(selectedProposalsList);
        const decissionPaperTemp = await getRfpDecisionPaperByRfpIdAsync(
          rfpDetails?.id
        );
        if (decissionPaperTemp) {
          setDecissionPaper(decissionPaperTemp);
          setHasDecisionPaper(true);
        } else {
          setHasDecisionPaper(false);
        }
      }
    } catch (error) {
      console.error("Error setting up RFP proposal approve/reject:", error);
    }
  };

  useEffect(() => {
    if (rfpDetails?.id) {
      setupRfpProposalApproveReject();
    }
  }, [rfpDetails?.id]);

  // Handle enableSelect logic when stepsList changes
  useEffect(() => {
    if (stepsList.length > 0) {
      let currentIndex = -1;
      for (let i = 0; i < stepsList.length; i++) {
        if (stepsList[i].current) {
          currentIndex = i;
        }
      }

      // Enable select if there are future steps after the current one
      if (currentIndex >= 0 && currentIndex < stepsList.length - 1) {
        setEnableSelect(true);
      }
    }
  }, [stepsList]);

  // Early return if rfpDetails is not available
  if (!rfpDetails) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {rfpDetails.status === 6 ? (

        <div className="w-full space-y-2 desktop:max-w-[712px] mx-auto rounded-lg h-full px-6 mt-4">
          <div className="bg-gray-50 rounded p-6 mb-3 border border-gray-200">
            <div className="w-full mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-[22px] leading-[33.8px]">
                  Award Vendor Proposal
                </h2>
              </div>
              <p className="text-sm text-gray-500">
                The following vendor has been awarded for this proposal.
              </p>
            </div>

            {/* Submitted Awards */}
            <div className="w-full">
              {selectedProposals.map((proposal) =>
                proposal.id === decissionPaper.vendorRfpProposalId ? (
                  <div key={proposal.id}>
                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-y-3 w-full text-sm mb-6">
                      <div>
                        <p className="text-gray-500">Vendor Name</p>
                        <p className="font-medium">$ {proposal.vendorName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vendor Code</p>
                        <p className="font-medium">$ {proposal.vendorCode}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bid amount</p>
                        <p className="font-medium">$ {proposal.bidAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tax Included</p>
                        <p className="font-medium">
                          {proposal.isTaxIncluded ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    {/* Table View */}
                    <ViewTable
                      columns={["itemName", "itemCode", "quantity", "amount"]}
                      columnLabels={{
                        itemName: "Item Name",
                        itemCode: "Item Code",
                        quantity: "Quantity",
                        amount: "Amount",
                      }}
                      items={proposal.vendorRfpProposalItems.map((item: any) => ({
                        id: item.id,
                        itemName: item.rfpItem.itemName,
                        itemCode: item.rfpItem.itemCode,
                        quantity: item.rfpItem.quantity,
                        amount: item.amount,
                      }))}
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      )
        : (
          <div className="w-full space-y-2 desktop:max-w-[712px] mx-auto rounded-lg h-full px-6 max-h-[890px] overflow-y-auto scrollbar">
            <div className="w-full">
              <span className="font-bold text-[16px] mb-[17.5px] flex">
                <GeneralDetailIcon className="size-5" />
                <span className="pl-[8px]">Approval for Award</span>
              </span>
            </div>
            {/* Readiness banner */}
            {!(hasDecisionPaper && evaluationDocuments.length > 0 && selectedProposals.length > 0) && (
              <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg p-3 mb-3 text-sm">
                Please provide all required items before proceeding with approval: Decision Paper, Evaluation Reports, and Vendor Proposals.
              </div>
            )}
            <div
              className={`border border-lightblue p-4 flex text-sm rounded-lg bg-[#EDF4FD] mb-[16px] flex-col`}
            >
              <div className="pr-[55px] group relative">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <span>Decision Paper:</span>
                </span>
                <div className="flex flex-col" onClick={() => setShowModal(true)}>
                  <p className="font-bold text-blue-600 cursor-pointer">
                    {"View >"}
                  </p>
                </div>
                <br/>
                {!hasDecisionPaper && (
                  <p className="text-xs text-red-600 mt-2">No decision paper found for this RFP.</p>
                )}
              </div>
              <span className="font-semibold text-sm flex items-center gap-2">
              <span>Evaluation Reports:</span>
            </span>
            {evaluationDocuments.length > 0 ? (
              <div className="flex flex-col">
                {evaluationDocuments.map((d: any, idx: number) => (
                  <span key={idx}>
                    <a
                      className="text-[13px] flex items-end"
                      href={d.documentUrl ? d.documentUrl : d.document}
                      target="blank"
                      download={d.documentName}
                    >
                      <DocumentIconByExtension
                        className="w-[25px] h-[25px]"
                        filePath={d.documentUrl}
                      />
                      <p
                        className="pl-[4px]"
                        style={{ color: "blue", textDecoration: "underline" }}
                      >
                        {d.documentName}
                      </p>
                    </a>
                    <label htmlFor="upload-eval-file"></label>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-600">No evaluation reports uploaded.</p>
            )}
            </div>
            
            <div className="w-full">
              <div className="space-y-4">
                <span className="font-bold text-sm mb-[8px] flex items-center gap-2">
                  <span>Vendor Proposals</span>
                </span>
                {selectedProposals.length > 0 ? (
                  <ViewTable
                    columns={["vendor", "bidAmount"]}
                    columnLabels={{ vendor: "Vendor", bidAmount: "Bid Amount" }}
                    items={selectedProposals.map((p: any) => ({
                      id: p.id,
                      vendor: p.vendorName || `Vendor #${p.vendorId}`,
                      bidAmount: p.bidAmount,
                    }))}
                  />
                ) : (
                  <p className="text-xs text-red-600">No vendor proposals available.</p>
                )}

                {/* Toggle for Bid split details */}
                {selectedProposals.length > 0 && (
                  <BidSplitSection proposals={selectedProposals} />
                )}

                <div>
                  <label className="block text-sm font-medium text-md mb-1">
                    Selected vendor for Award
                  </label>
                  <Select
                    className="w-[400px]"
                    placeholder="Select proposal"
                    disabled={!enableSelect}
                    onChange={(val) =>
                      setDecissionPaper((x: any) => ({
                        ...x,
                        vendorRfpProposalId: val,
                      }))
                    }
                    value={decissionPaper.vendorRfpProposalId}
                    allowClear
                    options={
                      selectedProposals.map((c: any) => ({
                        value: c.id,
                        label: c.vendorName,
                      })) || []
                    }
                  />
                </div>

                {/* Approval steps are only shown when all required inputs exist */}
                {hasDecisionPaper && evaluationDocuments.length > 0 && selectedProposals.length > 0 ? (
                  <StepIndicator steps={stepsList || []} />
                ) : (
                  <div className="text-xs text-gray-500">Approval steps will appear once all required items are provided.</div>
                )}
              </div>
            </div>

            {rfpDetails?.finalBidSubmitted == null && (
              <div className="w-full flex justify-end">
                <Button
                  type="primary"
                  onClick={() => {
                    (async () => {
                      await sendFinalBidRequestAsync(rfpDetails?.id);
                      trigger && trigger();
                    })();
                  }}
                >
                  Send Final Bid Request
                </Button>
              </div>
            )}

            {rfpDetails?.finalBidSubmitted == true ||
              rfpDetails?.finalBidSubmitted == null ? (
              <>
                <div className="w-full">
                  {(hasDecisionPaper && evaluationDocuments.length > 0 && selectedProposals.length > 0 ? stepsList : []).map((step, index) => {
                    // Find the index of the current step
                    // Find the latest step with currentUser that comes after stepCurrent
                    let currentIndex = -1;
                    for (let i = 0; i < stepsList?.length; i++) {
                      if (stepsList[i].current) {
                        currentIndex = i;
                      }
                    }

                    // Show all steps up to (and including) the currentIndex in StepCard
                    if (index <= currentIndex) {
                      return (
                        <StepCard
                          proposalId={decissionPaper.vendorRfpProposalId ?? 0}
                          flowType="rfpaward"
                          key={index}
                          step={step || []}
                          trigger={() => {
                            setupRfpProposalApproveReject();
                          }}
                        />
                      );
                    }

                    // Show future steps in a plain div
                    return (rfpDetails.status == 1 || rfpDetails.status == 2) &&
                      rfpDetails.createdBy == getUserCredentials().userId ? (
                      <StepCard
                        proposalId={decissionPaper.vendorRfpProposalId ?? 0}
                        flowType="rfpaward"
                        key={index}
                        step={step || []}
                        trigger={() => {
                          setupRfpProposalApproveReject();
                        }}
                      />
                    ) : (
                      <div
                        key={index}
                        className="text-gray-500 mb-4 bg-white px-2 py-2 rounded-md flex-col items-center justify-center"
                      >
                        {step.approverRole}{" "}
                        <p className="text-xs">
                          {step.approverName} | {step.approverEmail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="w-full">The RFP Under final bid submission</div>
            )}
          </div>
        )}

      <Modal
        width="4/4"
        title="Decision Paper for Award"
        contentPosition="center"
        isOpen={showModal}
        content={
          <RfpDecisionForm type={"view"} rfpIdFromParent={rfpDetails.id} />
        }
        onClose={() => {
          setShowModal((prev) => !prev);
        }}
      />
    </>
  );
};

export default RfpAwardflow;