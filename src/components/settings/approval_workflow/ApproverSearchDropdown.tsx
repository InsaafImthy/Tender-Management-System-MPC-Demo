import { Loader2 } from "lucide-react";
import { useState } from "react";
import { IUserDetails } from "../../../types/userTypes";
import userPhoto from '../../../assets/profile_photo/userPhoto.png';
import { IUser } from "../../../types/Types";

interface ApprovalflowUsers {
    id: number;
    stepOrder: number;
    approvalFlowMasterId: number;
    defaultApproverEmail: string;
    approverRole: string;
    approverId: number;
    approverName:string;
}

interface ApprovalFlowData {
    id?:number
    flowName: string;
    steps: ApprovalflowUsers[];
    flowType:number;
}

interface ApproverSearchDropdownProps {
    index: number;
    currentValue: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    approvers: IUserDetails[];
    isLoading: boolean;
    setApproverSelected: React.Dispatch<React.SetStateAction<boolean>>;
    formData: ApprovalFlowData;
    setFormData: React.Dispatch<React.SetStateAction<ApprovalFlowData>>;
}

const ApproverSearchDropdown: React.FC<ApproverSearchDropdownProps> = ({
    index,
    currentValue,
    setSearchQuery,
    approvers,
    isLoading,
    setApproverSelected,
    formData,
    setFormData,
}) => {
    // Find the currently selected approver from the provided approvers list.
    const currentApprover = approvers.find((a) => a.email === currentValue);
    // Using index to control open/close state of the dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);

    const filteredApprovers = approvers.filter(
        (user) => !formData.steps.some((approver) => approver.defaultApproverEmail === user.email)
    );

    const handleDropdownClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDropdownOpen(isDropdownOpen === index ? null : index);
    };

    const updateApprover = (index: number, user: IUser) => {
        setFormData((prev: ApprovalFlowData) => ({
            ...prev,
            steps: prev.steps.map((approver, i) =>
                i === index ? { ...approver, defaultApproverEmail:user.email, approverRole:user.roleName as string,approverId:Number(user.id), approverName:user.name} : approver
            ),
        }));
        setIsDropdownOpen(null);
        setSearchQuery("");
    };

    const handleApproverSelect = (approver: IUser) => {
        updateApprover(index, approver);
        setSearchQuery("");
        setApproverSelected(true);
        setIsDropdownOpen(null);
    };

    return (
        <div className="relative w-full">
            <div
                className="w-full p-2 border rounded-md cursor-pointer bg-white flex justify-between items-center"
                onClick={handleDropdownClick}
            >
                <div className="text-sm">
                    {currentApprover ? (
                        <>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3">
                                    {currentApprover.profilePhoto ? (
                                        <img
                                            src={""}
                                            alt="user Photo"
                                            className="w-full h-full z-2 rounded-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={userPhoto}
                                            alt="user Photo"
                                            className="w-full h-full z-2 rounded-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-col">
                                    <div className="font-medium text-sm">{currentApprover.name}</div>
                                    {/* <div className="font-medium text-gray-500 text-xs">{currentApprover.email}</div> */}
                                    <div className="mt-1 text-xs text-gray-500">
                                        <div>
                                            {currentApprover.roleName} | <span>{currentApprover.departmentName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </>
                    ) : (
                        "Select Approver"
                    )}
                </div>

                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isDropdownOpen === index && (
                <div
                    className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg text-xs"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full p-2 border-b text-xs focus:outline-none"
                            placeholder="Search approvers..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isLoading && (
                            <div className="absolute right-2 top-2">
                                <Loader2 />
                            </div>
                        )}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredApprovers.length > 0 ? (
                            filteredApprovers.map((approver) => (
                                <div
                                    key={approver.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleApproverSelect(approver as any)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3">
                                            {approver.profilePhoto ? (
                                                <img
                                                    src={""}
                                                    alt="user Photo"
                                                    className="w-full h-full z-2 rounded-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={userPhoto}
                                                    alt="user Photo"
                                                    className="w-full h-full z-2 rounded-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-col">
                                            <div className="font-medium text-sm">{approver.name}</div>
                                            {/* <div className="font-medium text-gray-500 text-xs">{currentApprover.email}</div> */}
                                            <div className="mt-1 text-xs text-gray-500">
                                                <div>
                                                    {approver.roleName} | <span>{approver.departmentName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ))
                        ) : (
                            <div className="p-2 text-gray-500 text-center">No approvers found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproverSearchDropdown;
