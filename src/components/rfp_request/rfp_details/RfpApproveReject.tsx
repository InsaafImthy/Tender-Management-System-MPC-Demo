// ApprovalWorkflow.tsx
import React, { useEffect, useState } from 'react';
import { getRpfApprovalFlowsByIdAsync } from '../../../services/flowService';
import { getUserCredentials } from '../../../utils/common';
import StepIndicator from './rfp_approve-reject_right_component/StepIndicator';
import StepCard from './rfp_approve-reject_right_component/StepCard';


interface IRfpDetailRight {
    rfpDetails: any
    trigger: () => void
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

    const setupRfpApproveReject = async () => {
        const response: any[] = await getRpfApprovalFlowsByIdAsync(rfpDetails?.id);
        const formatedSteps = response.map((item: any, i) => ({ ...item, current: (getUserCredentials().userId == item.approverId && (i == 0 || response[i - 1].status == 1)), status: item.status == 0 ? "pending" : item.status == 1 ? "approved" : "rejected" }));
        setStepsList(formatedSteps);
    }

    useEffect(() => {
        setupRfpApproveReject()
        trigger && trigger()
    }, [rfpDetails.id])

    return (
        <div className="w-full space-y-3 desktop:max-w-[600px] mx-auto rounded h-full px-3 mt-4">
            <StepIndicator steps={stepsList} />

            <div className="w-full space-y-2">
                {stepsList.map((step, index) => {
                    // Find the index of the current step

                    // Find the latest step with currentUser that comes after stepCurrent
                    let currentIndex = -1;
                    for (let i = 0; i < stepsList.length; i++) {
                        if (stepsList[i].current) {
                            currentIndex = i;
                        }
                    }

                    // Show all steps up to (and including) the currentIndex in StepCard
                    if (index <= currentIndex) {
                        return (
                            <StepCard
                                flowType='rfp'
                                key={index}
                                step={step || []}
                                trigger={() => {
                                    setupRfpApproveReject();
                                }}
                            />
                        );
                    }

                    // Show future steps in a plain div
                    return (
                        (rfpDetails.status == 1 || rfpDetails.status == 2) && (rfpDetails.createdBy == getUserCredentials().userId) ?
                            <StepCard
                                flowType='rfp'
                                key={index}
                                step={step || []}
                                trigger={() => {
                                    setupRfpApproveReject();
                                }}
                            /> :
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4 opacity-60">
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