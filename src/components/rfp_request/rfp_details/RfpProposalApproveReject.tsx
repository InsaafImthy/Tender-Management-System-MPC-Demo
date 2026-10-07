// ApprovalWorkflow.tsx
import React, { useEffect, useState } from 'react';
// import { getApprovalFlowById } from '../../services/flowService';
// import { getAllUsersByFilterAsync } from '../../services/userService';
// import { ApprovalStep } from '../../types/approvalTypes';
// import { handleFile } from '../../utils/common';
// import userPhoto from "../../../assets/profile_photo/userPhoto.png"
// import { IStep } from '../../../types/approvalflowTypes';
import Cookies from 'js-cookie';
import StepIndicator from './rfp_approve-reject_right_component/StepIndicator';
import StepCard from './rfp_approve-reject_right_component/StepCard';
import { GeneralDetailIcon } from '../../../utils/Icons';
import { loadRfpApprovalSteps } from '../../../features/rfpApproval/loadRfpApprovalSteps';


interface IRfpDetailRight {
    rfpDetails: any
    trigger: () => void | Promise<void>
}


// const tempflows: IStep[] = [{
//     id: 0,
//     photo: userPhoto,
//     approvalRequestId: 0,
//     approverId: 1,
//     approverRole: "admin",
//     approverEmail: "admin@123",
//     approverName: "Akkib",
//     current: true,
//     stepOrder: 1,
//     status: "pending",
//     actionDate: "2025-05-01",
//     comments: ""
// },
// {
//     id: 0,
//     photo: userPhoto,
//     approvalRequestId: 0,
//     approverId: 1,
//     approverRole: "admin",
//     approverEmail: "admin@123",
//     approverName: "Akkib",
//     current: false,
//     stepOrder: 2,
//     status: "pending",
//     actionDate: "2025-05-01",
//     comments: ""
// }, {
//     id: 0,
//     approvalRequestId: 0,
//     photo: userPhoto,
//     approverRole: "admin",
//     approverName: "Akkib",
//     approverId: 1,
//     approverEmail: "admin@123",
//     stepOrder: 3,
//     current: false,
//     status: "pending",
//     actionDate: "2025-05-01",
//     comments: ""
// }, {
//     id: 0,
//     approvalRequestId: 0,
//     photo: userPhoto,
//     approverRole: "admin",
//     approverEmail: "admin@123",
//     approverName: "Akkib",
//     approverId: 1,
//     stepOrder: 4,
//     current: false,
//     status: "pending",
//     actionDate: "2025-05-01",
//     comments: ""
// }]

const RfpProposalApproveReject: React.FC<IRfpDetailRight> = ({ rfpDetails, trigger }) => {
    const [stepsList, setStepsList] = useState<any[]>([])
    const [workflowMessage, setWorkflowMessage] = useState("");

    const setupRfpProposalApproveReject = async () => {
        try {
            const result = await loadRfpApprovalSteps(
                Number(rfpDetails?.id),
                "rfpproposal",
                Cookies.get("userId") || "",
            );
            setStepsList(result.steps);
            setWorkflowMessage(
                result.usedCachedDefinition
                    ? "The backend workflow could not be refreshed. Showing the cached approval workflow."
                    : result.steps.length === 0
                      ? "No approval workflow is configured for this RFP."
                      : "",
            );
        } catch (error) {
            console.error("Unable to load proposal-opening approval workflow:", error);
            setStepsList([]);
            setWorkflowMessage("Unable to load the approval workflow and no cached workflow is available.");
        }
    }

    useEffect(() => {
        setupRfpProposalApproveReject()
    }, [rfpDetails.id])

    return (
        <div className="w-full space-y-2 desktop:max-w-[712px] mx-auto rounded-lg h-full px-6 max-h-[890px] overflow-y-auto scrollbar">
            <StepIndicator steps={stepsList} />
            {workflowMessage && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                    {workflowMessage}
                </div>
            )}


            <div className="w-full">
                <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Approval for Open Vendor Proposals</span></span>
            </div>

            <div className="w-full">
                {stepsList.map((step, index) => {
                    if (step.current || step.status !== "pending") {
                        return (
                            <StepCard
                                flowType='rfpproposal'
                                key={step.id ?? index}
                                step={step || []}
                                trigger={async () => {
                                    await setupRfpProposalApproveReject();
                                    trigger();
                                }}
                            />
                        );
                    }

                    // Show future steps in a plain div
                    return (
                            <div key={step.id ?? index} className="text-gray-500 mb-4 bg-white px-2 py-2 rounded-md flex-col items-center justify-center">
                                {step.approverRole} <p className='text-xs'>{step.approverName} | {step.approverEmail}</p>
                            </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RfpProposalApproveReject;
