import React from "react";
// import { formatDate } from "../../../utils/common";
import { IStep } from "../../../../types/approvalflowTypes";
import dayjs from "dayjs";

const CompletedStep: React.FC<{ step: IStep, current?: boolean }> = ({ step }) =>{
    console.log(step)
    return (   
    <div className="bg-white rounded-lg mb-4">
        <div className="flex flex-col gap-2 text-sm rounded-lg mb-2 bg-[#EBEEF480] p-4">
            <div className="flex gap-6">
                <div className="flex flex-col">
                    <span className="text-gray-500">Status</span>
                    {step.status && <span
                        className={`px-2 py-0.5 text-xs rounded-full ${step.status === "approved" || step.status === "initiated"
                            ? "bg-green-100 text-green-700 border-green-500 border max-w-32"
                            : step.status==="rejected"?"bg-red-100 text-red-700 border-red-500 border max-w-32":"bg-orange-100 text-orange-600"
                            }`}
                    >
                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </span>}
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500">{step.status === "initiated"?"Initiated on":step.status === "approved"?"Approved on":"Rejected on"}</span>
                    {/* {step.actionDate && <span>{formatDate(step.actionDate)}</span>} */}
                    {step.actionDate && <span>{dayjs(step.actionDate).format("DD-mm-YYYY")}</span>}
                </div>
            </div>

            <div className="">
                {step.comments && (
                    <div className="text-sm ">
                        <div className="font-medium mb-1">Comments</div>
                        <p>{step.comments}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
)};


export default CompletedStep
