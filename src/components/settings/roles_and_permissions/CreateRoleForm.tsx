import React, { useState } from 'react';
import TextField from '../../basic_components/TextField';
import { IModalProps } from '../../../types/commonTypes';
import { createRoleAsync, updateRoleByIdAsync } from '../../../services/roleService';
import { notification } from 'antd';
import { Loader2 } from 'lucide-react';

interface FormErrors {
    roleName?: string;
}

interface ICreateRoleForm extends IModalProps {
    type: "create" | "edit";
    roleName?: string;
    roleId?: string
}

const CreateRoleForm: React.FC<ICreateRoleForm> = ({ type = "create", roleName, trigger, closeModal, roleId }) => {
    const [formData, setFormData] = useState<{ roleName: string }>({
        roleName: type === "create" ? "" : roleName ?? ""
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setIsLoading(true);
            e.preventDefault();

            if (!formData.roleName) {
                setErrors((prev) => ({
                    ...prev,
                    roleName: "Role is required"
                }));
                return; // Stop form submission if there's an error
            }

            if(!/^[a-zA-Z0-9 ]+$/.test(formData.roleName)){
                setErrors((prev) => ({
                    ...prev,
                    roleName: "Role must not contain special characters"
                }));
                return; // Stop form submission if there's an error
            }

            console.log('Form submitted:', formData);

            if (type === "edit" && roleId) {
                console.log("Editing role via API");
                const response = await updateRoleByIdAsync(roleId, {
                    ...formData,
                    roleName: formData.roleName.trim(),
                    permissions: [],
                })
                if (response) {
                    trigger();
                    closeModal()
                }
            } else {
                console.log("Creating role via API");
                const response = await createRoleAsync({
                    ...formData,
                    roleName: formData.roleName.trim()
                })
                if (response) {
                    trigger();
                    closeModal()
                }
            }
            notification.success({
                message: type === "create" ? "Role created successfully": "Role updated successfully",
            })
        } catch (error: any) {
            notification.error({
                message:type === "edit" ? "Role updation error": "Role creation error",
                description: error.message
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
                <p className="text-xl font-bold">
                    {type === "create" ? "Add new role" : "Edit role"}
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Role<span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="role"
                        field="Role"
                        value={formData.roleName}
                        setValue={(value) => setFormData((prev) => ({ ...prev, roleName: value }))}
                        placeholder="Enter role"
                        style=""
                        type="text"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, role: "" }))}
                    />
                    {errors.roleName && <p className="text-red-500 text-xs">{errors.roleName}</p>}
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

export default CreateRoleForm;
