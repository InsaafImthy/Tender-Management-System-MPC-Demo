import React, { useState } from 'react';
import TextField from '../../basic_components/TextField';
import { IModalProps } from '../../../types/commonTypes';
import { IDepartment } from '../../../types/departmentTypes';
import { createDepartmentAsync, updateDepartmentAsync } from '../../../services/departmentService';
import { notification } from 'antd';
import { Loader2 } from 'lucide-react';

interface FormErrors {
    departmentCode?: string;
    departmentName?: string;
}

interface ICreateDepartmentForm extends IModalProps {
    type?: "edit" | "create",
    department: IDepartment,
    trigger: () => void
}
const CreateDepartmentForm: React.FC<ICreateDepartmentForm> = ({ type = "create", department, trigger, closeModal }) => {

    const [formData, setFormData] = useState<IDepartment>(
        type === "create"
            ? ({
                departmentName: "",
                departmentCode: ""
            })
            : department
    );


    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setIsLoading(true);

            if (!formData.departmentCode) {
                setErrors((prev) => ({
                    ...prev,
                    departmentCode: "Department ID is required"
                }));
                return;
            }

            if (!/^[a-zA-Z0-9]+$/.test(formData.departmentCode)) {
                setErrors((prev) => ({
                    ...prev,
                    departmentCode: "Department ID must not contain special characters"
                }));
                return;
            }


            if (!formData.departmentName) {
                setErrors((prev) => ({
                    ...prev, departmentName: "Department name required"
                }))
                return;
            }

            if (!/^[a-zA-Z0-9 ]+$/.test(formData.departmentName)
            ) {
                setErrors((prev) => ({
                    ...prev,
                    departmentName: "Department name must not contain special characters"
                }));
                return;
            }

            console.log(errors)
            // Add your form validation and submission logic here


            console.log('Form submitted:', formData);
            if (type == "edit") {
                await updateDepartmentAsync(formData.id as string, formData);
                notification.success({
                    message: "Department updated successfully"
                })
            } else {
                await createDepartmentAsync(formData);
                notification.success({
                    message: "Department created successfully"
                })
            }
            closeModal();
            trigger()
            window.location.reload();
        } catch (err: any) {
            notification.error({
                message: err.message
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
                <p className="text-xl font-bold">{type == "create" ? "Add new department" : "Edit department"}</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Department code <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        maxLength={6}
                        id="departmentCode"
                        field="Department ID"
                        value={formData.departmentCode}
                        setValue={(value) => setFormData((prev) => ({ ...prev, departmentCode: value }))}
                        placeholder="Enter department ID"
                        style=""
                        type="text"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, departmentCode: "" }))}
                    />
                    {errors.departmentCode && <p className="text-red-500 text-xs">{errors.departmentCode}</p>}
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Department name <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="departmentName"
                        field="Department Name"
                        value={formData.departmentName}
                        setValue={(value) => setFormData((prev) => ({ ...prev, departmentName: value }))}
                        placeholder="Enter department Name"
                        style=""
                        type="text"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, departmentName: "" }))}
                    />
                    {errors.departmentName && <p className="text-red-500 text-xs">{errors.departmentName}</p>}
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="sticky bottom-0 border-t bg-white p-4 mt-auto">
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-sm text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {isLoading ? <Loader2 /> : type === "edit" ? "Update" : "Submit"}
                    </button>
                    <button
                        onClick={() => closeModal()}
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateDepartmentForm;