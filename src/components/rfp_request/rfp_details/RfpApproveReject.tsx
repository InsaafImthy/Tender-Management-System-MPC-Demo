// ApprovalWorkflow.tsx
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import StepIndicator from './rfp_approve-reject_right_component/StepIndicator';
import StepCard from './rfp_approve-reject_right_component/StepCard';
import { loadRfpApprovalSteps } from '../../../features/rfpApproval/loadRfpApprovalSteps';


interface IRfpDetailRight {
    rfpDetails: any
    trigger: () => void | Promise<void>
}


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

const RfpApproveReject: React.FC<IRfpDetailRight> = ({ rfpDetails, trigger }) => {
    const [stepsList, setStepsList] = useState<any[]>([])
    const [workflowMessage, setWorkflowMessage] = useState("");

    const setupRfpApproveReject = async () => {
        try {
            const result = await loadRfpApprovalSteps(
                Number(rfpDetails?.id),
                "rfp",
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
            console.error("Unable to load RFP approval workflow:", error);
            setStepsList([]);
            setWorkflowMessage("Unable to load the approval workflow and no cached workflow is available.");
        }
    }

    useEffect(() => {
        setupRfpApproveReject()
    }, [rfpDetails.id])

    return (
        <div className="w-full space-y-3 desktop:max-w-[600px] mx-auto rounded h-full px-3 mt-4">
            <StepIndicator steps={stepsList} />
            {workflowMessage && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                    {workflowMessage}
                </div>
            )}

            <div className="w-full space-y-2">
                {stepsList.map((step, index) => {
                    if (step.current || step.status !== "pending") {
                        return (
                            <StepCard
                                flowType='rfp'
                                key={step.id ?? index}
                                step={step || []}
                                trigger={async () => {
                                    await setupRfpApproveReject();
                                    trigger();
                                }}
                            />
                        );
                    }

                    // Show future steps in a plain div
                    return (
                            <div key={step.id ?? index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4 opacity-60">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <span className="text-gray-400 text-lg">
                                            {step.approverRole === 'HOD' ? '👨‍💼' : 
                                             step.approverRole === 'IT' ? '💻' : 
                                             step.approverRole === 'Finance' ? '💰' : '👤'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-500">{step.approverRole}</h4>
                                        <p className="text-sm text-gray-400">{step.approverName} | {step.approverEmail}</p>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RfpApproveReject;
