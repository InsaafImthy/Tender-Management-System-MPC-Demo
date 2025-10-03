import React, { useState, useEffect, SetStateAction } from 'react';
import TextField from '../../basic_components/TextField';
import { IFilterDto, IModalProps } from '../../../types/commonTypes';
import ApproverSearchDropdown from './ApproverSearchDropdown';
import { notification } from 'antd';
import { createWorkFlowAsync, editWorkFlowAsync } from '../../../services/flowService';
import { Loader2 } from 'lucide-react';
import { getAllUsersByFilterAsync } from '../../../services/userService';

interface ApprovalflowUsers {
    id: number;
    stepOrder: number;
    approvalFlowMasterId: number;
    defaultApproverEmail: string;
    approverRole: string;
    approverId: number;
    approverName: string;
}

interface ApprovalFlowData {
    id?: number
    flowName: string;
    steps: ApprovalflowUsers[];
    flowType: number
}

interface FormErrors {
    flowName: string;
    steps: ApprovalflowUsers[];
}

interface IApprovalWorkflowForm extends IModalProps {
    type?: "edit" | "create";
    flowType: number;   
    initialData?: any;
    onSubmit?: (data: ApprovalFlowData) => void;
    seViewType: React.Dispatch<SetStateAction<"view" | "edit" | "create">>;
}


const defaultFilter = {
    fields: [],
    pageNo: 1,
    pageSize: 10,
    sortColumn: "CreatedAt",
    sortOrder: "DESC"
}

const ApprovalWorkflowForm: React.FC<IApprovalWorkflowForm> = ({
    seViewType,
    type = "create",
    flowType = "vendor",
    initialData,
    trigger,
    closeModal
}) => {
    const [formData, setFormData] = useState<ApprovalFlowData>({
        id: initialData?.id || 0,
        flowName: initialData?.flowName || "",
        steps: initialData?.steps || [],
        flowType: initialData?.flowType ?? flowType
    });

    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonnLoading] = useState(false);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [approverSelected, setApproverSelected] = useState(true);


    useEffect(() => {
        setFormData({
            id: initialData?.id || 0,
            flowName: initialData?.flowName || "",
            steps: initialData?.steps || [],
            flowType: initialData?.flowType
        });
    }, [initialData])
    useEffect(() => {
        handleSearch()
    }, [searchQuery])

    const handleSearch = async () => {
        const updatedFilter = {
            ...defaultFilter,
            globalSearch: searchQuery
        };
        await getApproversFilter(updatedFilter);
    };

    const getApproversFilter = async (filterDto: IFilterDto = defaultFilter) => {
        try {
            setIsLoading(true);
            let approvers: any = await getAllUsersByFilterAsync(filterDto)
            setUsersList(approvers?.items);
            // setTrigger(false);
        } catch (err: any) {
            // notification.error({
            //     message: "error fetching users",
            //     description: err.message
            // })
        } finally {
            setIsLoading(false);
        }
    };


    const validateForm = (): FormErrors => {
        const newErrors: any = {};

        if (!formData.flowName.trim()) {
            newErrors.flowName = "Flow name is required";
        }
        if (!formData.steps || formData.steps.length == 0) {
            newErrors.steps = ["At least one approver is required"];
        }

        formData.steps.forEach(u => { if (!u.defaultApproverEmail) newErrors.steps = ["At least one approver is required"]; })

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validateForm();
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                if (formData.steps.length == 0) return;
                setIsButtonnLoading(true);
                if (type == "create") {
                    console.log(formData)
                    formData.flowType = initialData?.flowType ?? flowType;
                    let response = await createWorkFlowAsync(formData)
                    console.log(response)
                    if (response) {
                        notification.success({
                            message: "workflow created successfully",
                        })
                    }
                } else {
                    if (initialData) {
                        let response = await editWorkFlowAsync(formData);
                        console.log(response)
                        notification.success({
                            message: "workflow updated successfully"
                        })
                    }
                }
                trigger();
                closeModal();
                seViewType("view")

            } catch (error: any) {
                console.log(error);
                notification.error({
                    message: `Workflow not ${type == "create" ? "created" : "updated"}`,
                    description: error.message
                })

            } finally {
                setIsButtonnLoading(false);
            }
        }
    };

    const addApprover = () => {

        setApproverSelected(false);
        setFormData(prev => ({
            ...prev,
            steps: [
                ...prev.steps,
                {
                    id: 0,
                    approvalFlowMasterId: 0,
                    approverRole: "",
                    defaultApproverEmail: "",
                    stepOrder: prev.steps.length + 1,
                    approverId: 0,
                    approverName: ""
                }
            ]
        }));
    };

    const removeApprover = (index: number) => {
        setApproverSelected(true)
        setFormData(prev => ({
            ...prev,
            steps: prev.steps
                .filter((_, i) => i !== index)
                .map((approver, i) => ({
                    ...approver,
                    stepOrder: i + 1
                }))
        }));
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full rounded">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b">
                <p className="text-xl font-bold">
                    {type === "create" ? "Create flow" : "Edit flow"}
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {/* Flow Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Flow name <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="flowName"
                        field="Flow Name"
                        value={formData.flowName}
                        setValue={(value) => {
                            setFormData(prev => ({ ...prev, flowName: value }));
                            setErrors((prev: any) => ({ ...prev, flowName: undefined }));
                        }}
                        style='bg-white'
                        placeholder="Enter flow name"
                        type="text"
                        width="w-full"
                    />
                    {errors.flowName && (
                        <p className="text-red-500 text-xs mt-1">{errors.flowName}</p>
                    )}
                </div>

                {/* Approval Workflow */}
                <div className="space-y-2">
                    <label className="block text-[16px] font-semibold">Approval Hierarchy</label>
                    {errors.approvalflowUsers && (
                        <p className="text-red-500 text-xs mt-1">{errors.approvalflowUsers}</p>
                    )}
                    <div className="space-y-8">
                        {formData.steps.map((approver, index) => (
                            <div key={index} className="relative">
                                <div className="shadow-lg rounded-lg bg-white p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-gray-600">Approver {index + 1}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeApprover(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    {usersList && <ApproverSearchDropdown setApproverSelected={setApproverSelected} formData={formData} isLoading={isLoading} setFormData={setFormData} approvers={usersList} setSearchQuery={setSearchQuery} index={index} currentValue={approver.defaultApproverEmail} />}
                                </div>

                                {(approverSelected ? (index < formData.steps.length) : (index < formData.steps.length - 1)) && (
                                    <div className="absolute left-1/2 -translate-x-1/2 h-8 flex items-center justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                            <path
                                                d="M12 4L12 20M12 20L6 14M12 20L18 14"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}

                        {approverSelected && <button
                            type="button"
                            onClick={addApprover}
                            className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto hover:bg-blue-600 transition-colors shadow-lg"
                        >
                            <span className="text-md text-center">+</span>
                        </button>}
                    </div>
                </div>
            </div>
            <div className="sticky bottom-0 border-t bg-white p-4 mt-auto">
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-sm text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {isButtonLoading ? <Loader2 /> : type === "edit" ? "Update" : "Submit"}
                    </button>
                    <button
                        type="button"
                        onClick={() => closeModal()}
                        className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ApprovalWorkflowForm;