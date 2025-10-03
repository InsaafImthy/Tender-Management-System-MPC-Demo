import React, { ChangeEvent, useContext, useState } from 'react';
import TextField from '../../basic_components/TextField';
import SelectField from '../../basic_components/SelectField';
import { IModalProps } from '../../../types/commonTypes';
import { User } from '../../../types/userTypes';
import { IDepartment } from '../../../types/departmentTypes';
import { IRole } from '../../../types/roleTypes';
import userLogo from "../../../assets/profile_photo/userPhoto.png";
import { createOrUpdateUserAsync } from '../../../services/userService';
import { notification } from 'antd';
import { Loader2 } from 'lucide-react';
import validator from "validator";
import { procurementContext } from "../../../routes/RouteComponent";
import Cookies from "js-cookie";

interface FormErrors {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    department?: string;
    role?: string;
    countryCode?: string;
    phone?: string;
    place?: string;
    gender?: string;
}

interface ICreateUserForm extends IModalProps {
    type?: "edit" | "create";
    user?: User;
    roles: IRole[];
    departments: IDepartment[];
    trigger: () => void;
    closeModal: () => void;
}

const CreateUserForm: React.FC<ICreateUserForm> = ({
    type = "create",
    user,
    roles,
    departments,
    trigger,
    closeModal
}) => {
    // Parse phone and country code for edit mode
    const { countryCodes } = useContext(procurementContext);

    const parsePhoneDetails = (phone?: string) => {
        if (!phone) return { countryCode: "", phone: "" };
        const parts = phone.split("-");
        return parts.length > 1
            ? { countryCode: countryCodes?.find((x) => x.code == parts[0])?.id, phone: parts[1].replace(/}$/, "") } // Remove trailing } if present
            : { countryCode: "", phone: phone };
    };

    const initialUserState: User = type === "create"
        ? {
            name: "",
            email: "",
            userName: "",
            password: "",
            departmentName: "",
            departmentId: "",
            roleName: "",
            roleId: "",
            countryCode: "",
            phone: "",
            gender: "male",
            place: ""
        }
        : {
            ...user,
            password: "",
            ...parsePhoneDetails(user?.phone)
        } as User;

    const [userDetail, setUserDetail] = useState<User>(initialUserState);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ file: File; image: string | undefined }>();


    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedFile({
                    file: file,
                    image: event.target?.result as string
                });
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Error reading file:", err);
            notification.error({
                message: "File upload failed",
                description: "Unable to read the selected file."
            });
        }
    };

    const validateForm = (): FormErrors => {
        const errors: FormErrors = {};

        // Name validation
        if (!userDetail.name || !/^[a-zA-Z\s]{2,}$/.test(userDetail.name)) {
            errors.name = "Name must contain only letters and spaces (at least 2 characters).";
        }

        // Email validation
        if (!userDetail.email || !validator.isEmail(userDetail.email)) {
            errors.email = "Please enter a valid email address";
        }

        // Username validation
        const trimmedUsername = userDetail.userName?.trim() || "";
        if (trimmedUsername.length < 3) {
            errors.username = "Username must be at least 3 characters long.";
        }

        // Password validation
        const passwordValidation = (password: string) =>
            password.trim().length >= 6 && !/\s/.test(password);

        if (type === "create") {
            if (!passwordValidation(userDetail.password as string)) {
                errors.password = "Password must be at least 6 characters long and cannot contain spaces.";
            }
        } else if (userDetail.password) {
            if (!passwordValidation(userDetail.password)) {
                errors.password = "Password must be at least 6 characters long and cannot contain spaces.";
            }
        }

        // Confirm password validation
        if (userDetail.password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        // Department validation
        if (!userDetail.departmentId) {
            errors.department = "Department selection is required.";
        }

        // Role validation
        if (!userDetail.roleId) {
            errors.role = "Role selection is required.";
        }

        // Phone and country code validation
        if (!userDetail.countryCode) {
            errors.countryCode = "Country code is required.";
        }

        if (!userDetail.phone || !/^\d{8,15}$/.test(userDetail.phone)) {
            errors.phone = "Phone number must be between 8 to 15 digits.";
        }

        if (!userDetail.place) {
            errors.place = "Place is required.";
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            setIsLoading(true);
            // Format phone with country code properly
            // const formattedPhone = `${countryCodes?.find((x) => x.id == userDetail.countryCode)?.countryCode}-${userDetail.phone}`;
            const formattedPhone = `${userDetail.phone}`;
            console.log({
                ...userDetail,
                phone: formattedPhone,
            }, "userDetail")
            console.log(userDetail.countryCode);
            console.log(countryCodes);



            const formData: User = type === "create"
                ? ({
                    ...userDetail,
                    phone: formattedPhone,
                    id:0,
                    tenantId:Cookies.get("tenantId"),
                    companyId:Cookies.get("companyId"),
                    branchId:Cookies.get("branchId"),                                        
                    isActive: true,
                    isEmailSent: false,
                    isVendor: false,
                    
                })
                : ({
                    ...userDetail,
                    phone: formattedPhone
                })

            //   if (selectedFile) formData.append("photo", selectedFile.file);

            //   // Append all user details to FormData
            //   Object.entries({
            //     ...userDetail,
            //     phone: formattedPhone
            //   }).forEach(([key, value]) => {
            //     if (value !== undefined && value !== null && key !== 'countryCode') {
            //       formData.append(key, value.toString());
            //     }
            //   });

            //   // Only append password if it's not empty
            //   if (userDetail.password) {
            //     formData.append("password", userDetail.password);
            //   }

            if (type === "edit") {
                await createOrUpdateUserAsync(formData);
                notification.success({
                    message: "User updated successfully",
                    description: `User ${userDetail.name} has been updated.`
                });
            } else {
                await createOrUpdateUserAsync(formData);
                notification.success({
                    message: "User created successfully",
                    description: `User ${userDetail.name} has been added.`
                });
            }

            trigger();
            closeModal();
        } catch (err: any) {
            console.error(err);
            notification.error({
                message: `User ${type === "create" ? "creation" : "update"} failed`,
                description: err.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Prepare country code options
    const countryCodeOptions = countryCodes?.map(country => ({
        label: country.countryCode,
        value: country.id
    })) || [];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
                <p className="text-xl font-bold">{type === "create" ? "Add new user" : "Edit user"}</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-start mb-3">
                    <label htmlFor='inp-file'>
                        <div className="w-[80px] h-[80px] rounded-full bg-red-300 overflow-hidden">
                            <img
                                className="w-full h-full object-cover"
                                src={selectedFile?.image ? selectedFile.image : type === "edit" ? userDetail.photoUrl || userLogo : userLogo}
                                alt="User"
                            />
                            <input id='inp-file' type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e)} />
                        </div>
                    </label>
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="name"
                        field="name"
                        value={userDetail.name}
                        setValue={(value) => setUserDetail((prev) => ({ ...prev, name: value }))}
                        placeholder="Enter user name"
                        style=""
                        type="text"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, name: "" }))}
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <div className="flex space-x-4">
                        {['Male', 'Female', 'Other'].map((option) => (
                            <label key={option} className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={option.toLowerCase()}
                                    checked={userDetail.gender === option.toLowerCase()}
                                    onChange={(e) => setUserDetail((prev) => ({ ...prev, gender: e.target.value }))}
                                    className="mr-2"
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="email"
                        field="email"
                        value={userDetail.email}
                        setValue={(value) => setUserDetail((prev) => ({ ...prev, email: value.trim() }))}
                        placeholder="Enter email"
                        style=""
                        type="text"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, email: "" }))}
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="userName"
                        field="username"
                        value={userDetail.userName}
                        setValue={(value) => setUserDetail((prev) => ({ ...prev, userName: value.trim() }))}
                        placeholder="Enter username"
                        style=""
                        type="text"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, username: "" }))}
                    />
                    {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        eye={true}
                        id="password"
                        field="password"
                        value={userDetail.password}
                        setValue={(value) => setUserDetail((prev) => ({ ...prev, password: value.trim() }))}
                        placeholder="Enter password"
                        style=""
                        type="password"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, password: "" }))}
                    />
                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        eye={true}
                        id="confirmPassword"
                        field="confirmPassword"
                        value={confirmPassword}
                        setValue={(value) => setConfirmPassword(value.trim())}
                        placeholder="Confirm password"
                        style=""
                        type="password"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, confirmPassword: "" }))}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <SelectField
                        id="departmentId"
                        label=""
                        style="w-full h-10"
                        value={departments.find(d => d.id === userDetail.departmentId)?.departmentName as string || "Select department"}
                        options={departments.map(d => ({ label: d.departmentName as string, value: d.id as string }))}
                        onChange={(value) => {
                            setUserDetail((prev) => ({ ...prev, departmentId: value }));
                            setErrors((prev) => ({ ...prev, department: "" }));
                        }}
                        onClick={() => setErrors((prev) => ({ ...prev, department: "" }))}
                    />
                    {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <SelectField
                        id="roleId"
                        label=""
                        style="w-full h-10"
                        value={roles.find(r => r.id === userDetail.roleId)?.roleName as string || "Select role"}
                        options={roles.map(r => ({ label: r.roleName as string, value: r.id as string }))}
                        onChange={(value) => {
                            setUserDetail((prev) => ({ ...prev, roleId: value }));
                            setErrors((prev) => ({ ...prev, role: "" }));
                        }}
                        onClick={() => setErrors((prev) => ({ ...prev, role: "" }))}
                    />
                    {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="w-2/5 mt-2">
                            <SelectField
                                id="countrycode"
                                label=""
                                value={countryCodes?.find((x) => x.id === userDetail.countryCode)?.countryCode || "Country Code"}
                                options={countryCodeOptions}
                                onChange={(value) => {
                                    setUserDetail((prev) => ({ ...prev, countryCode: value }));
                                    setErrors((prev) => ({ ...prev, countryCode: "", phone: "" }));
                                }}
                            />
                            {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>}
                        </div>

                        <div className="w-2/3">
                            <TextField
                                id="phone"
                                field="phone"
                                value={userDetail.phone}
                                setValue={(value) => setUserDetail((prev) => ({ ...prev, phone: value.trim() }))}
                                placeholder="Enter phone number"
                                type="number"
                                step={false}
                                width="w-full"
                                onFocus={() => setErrors((prev) => ({ ...prev, phone: "" }))}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-2">
                        Place <span className="text-red-500">*</span>
                    </label>
                    <TextField
                        id="place"
                        field="place"
                        value={userDetail.place}
                        setValue={(value) => setUserDetail((prev) => ({ ...prev, place: value }))}
                        placeholder="Place"
                        style=""
                        type="textarea"
                        width="w-full"
                        onFocus={() => setErrors((prev) => ({ ...prev, place: "" }))}
                    />
                    {errors.place && <p className="text-red-500 text-xs">{errors.place}</p>}
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
                        className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateUserForm;