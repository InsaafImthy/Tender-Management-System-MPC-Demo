import React, { useEffect, useState } from "react";
import userPhoto from "../../../assets/profile_photo/userPhoto.png"
import { Vendor } from "../../../types/vendorTypes";
import ViewTable from "../../basic_components/ViewTable";
import { DocumentIconByExtension, GeneralDetailIcon } from "../../../utils/Icons";
import dayjs from "dayjs";

interface VendorDetailLeftProp {
    vendorDetails: Vendor
}

const CommonCard = ({ data, className }: { data: Record<string, any>, className?: string }) => {
    return (
        <div
            className={`border border-lightblue p-4 flex text-sm rounded-lg bg-[#EDF4FD] ${className}`}
        >
            {Object.keys(data).map((k) => (
                <div key={k} className="pr-[55px] group relative">
                    <p className="mb-1 text-gray-500">{k}</p>
                    <span className="block truncate">{data[k]}</span>

                    {/* Tooltip on Hover */}
                    {data[k].length > 16 && <div className="absolute left-0 top-full hidden group-hover:flex bg-[#EDF4FD] shadow-md p-2 rounded w-max max-w-[300px] z-10 border border-gray-300">
                        {data[k]}
                    </div>}
                </div>
            ))}
        </div>
    )
}

type KeyValueProps = {
    data: {
        label: string;
        value: React.ReactNode;
    }[];
    className: string;
};

export const KeyValueGrid: React.FC<KeyValueProps> = ({ data, className }) => {
    return (
        <div className={`grid grid-cols-2 gap-y-[16px] ${className}`}>
            {data.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                    <span className="text-[12px] text-gray-500 mb-[4px]">{item.label}</span>
                    <span className="text-[14px] text-gray-900">{item.value}</span>
                </div>
            ))}
        </div>
    );
};

type UserBadge = {
    name: string;
    avatarUrl: string;
};

type UserBadgesProps = {
    title: string;
    users: UserBadge[];
};

export const UserBadges: React.FC<UserBadgesProps> = ({ title, users }) => {
    return (
        <div className="flex flex-col mb-[16px]">
            <span className="text-[14px] text-gray-500 mb-[8px]">{title}</span>
            <div className="flex items-center gap-[8px]">
                {users.map((user, idx) => (
                    <div
                        key={idx}
                        className="flex items-center bg-purple-100 rounded-full py-1 px-3"
                    >
                        <img
                            src={user.avatarUrl || userPhoto}
                            alt={user.name}
                            className="w-[24px] h-[24px] rounded-full mr-[8px]"
                        />
                        <span className="text-[14px] text-gray-800">{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VendorDetailLeft: React.FC<VendorDetailLeftProp> = ({ vendorDetails }: VendorDetailLeftProp) => {
    const [vendorDocuments, setvendorDocuments] = useState<any[]>([]);
    const setDocuments = async () => {
        try {
            if (vendorDetails) {
                console.log(vendorDetails?.vendorDocuments, 'vendorDetails?.vendorDocuments');
                const documents_to_display = vendorDetails?.vendorDocuments.map((d: any) =>
                    ({ ...d, type: d.documentType, attachmentComponent: <a className="text-[13px] flex items-end" href={d.filePath} download={d.fileName}><DocumentIconByExtension className="w-[25px] h-[25px]" filePath={d.filePath} /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{d.fileName}</p></a> })
                )
                setvendorDocuments(documents_to_display);
            }
        } catch (err) { }
    }

    useEffect(() => {
        console.log(vendorDetails,)
        setDocuments()
    }, [vendorDetails])

    return (
        <div className="h-full flex items-center bg-white flex-col px-10 pt-6 border-r border-gray-200">
            {vendorDetails && <>
                {/* Project Name,ID */}
                <div className="mb-[16px]" style={{ width: "504px" }}>
                    <span className="font-bold text-[22px] leading-[33.8px] mb-[8px] block">{vendorDetails.organisationName}</span>
                    <span style={{ padding: "4px 8px", border: "1px solid #A8AEBA", borderRadius: "20px", fontSize: "14px", backgroundColor: "#EBEEF4" }}>ID: {vendorDetails?.vendorCode || "-"}</span>
                </div>

                <div className="h-full mb-[16px]" style={{ width: "504px" }}>
                    <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">General Details</span></span>
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-md bg-bgBlue">
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.city?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">State</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.state?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Country</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.country?.countryName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">PO Box / Postal Code</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.postalCode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Fax</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.fax}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.vendorEmail}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Website</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.website}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Business Grade</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.businessGrade}</p>
                        </div>
                        {/* <div>
                            <p className="text-sm text-gray-500">Commercial Reg No.</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.commercialRegNo}</p>
                        </div> */}
                        {/* <div>
                            <p className="text-sm text-gray-500">Way No.</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.wayNo}</p>
                        </div> */}
                        <div>
                            <p className="text-sm text-gray-500">Address 1.</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.address1}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Address 2.</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.address2}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Organisation Legal Structure</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.organisationLegalStructure}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Other Organisation Legal Structure</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.otherOrganisationLegalStructure}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Related to Our Stakeholders</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.relatedToStakeholders ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Principle Activity of the Company</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails.activitiesOfCompany}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date added</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.createdAt ? dayjs(vendorDetails.updatedAt).format("DD/MM/YYYY") : "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Last active</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.updatedAt ? dayjs(vendorDetails.updatedAt).format("DD/MM/YYYY") : "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-[24px]" style={{ width: "504px" }}>
                    <span className="mb-[4px]" style={{ color: "gray", fontSize: "14px" }}>Categories</span>
                    <ViewTable columnLabels={{ index: "No.", name: "Category" }} columns={["index", "name"]} items={vendorDetails?.vendorCategories.map((x, i) => ({ ...x, index: i + 1 })) || []} />
                </div>

                {/* Vendor Details */}
                <div className="h-full" style={{ width: "504px" }}>
                    <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Vendor Details</span></span>
                    <CommonCard data={{
                        "Owner name": `${vendorDetails?.firstName} ${vendorDetails?.lastName}` as string,
                        "Email": vendorDetails?.vendorEmail ?? "-" as string,
                        "Phone": vendorDetails?.phone as string
                    }} className="mb-[16px]" />
                    <div className="mb-[24px]" style={{ width: "504px" }}>
                        <span className="mb-[4px]" style={{ color: "gray", fontSize: "14px" }}>Users</span>
                        <ViewTable columnLabels={{ name: "Name", email: "Email", phone: "Phone" }} columns={["name", "email", "phone"]} items={vendorDetails?.usersDetails.map((x, i) => ({ ...x, index: i })) || []} />
                    </div>
                    <div className="mb-[24px]" style={{ width: "504px" }}>
                        <span className="mb-[4px]" style={{ color: "gray", fontSize: "14px" }}>Divissions</span>
                        <ViewTable columnLabels={{ divisionName: "Division", contactDetails: "Contact Details" }} columns={["divisionName", "contactDetails"]} items={vendorDetails?.vendorDivissions.map((x, i) => ({ ...x, index: i })) || []} />
                    </div>
                </div>
                <div className="h-full mb-[16px]" style={{ width: "504px" }}>
                    <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Bank Details</span></span>
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-md bg-bgBlue">
                        <div>
                            <p className="text-sm text-gray-500">Bank Name</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.bankName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Branch</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.bankBranch}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">IFSC Code</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.bankIFSCCode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Account Number</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.bankAccountNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Beneficiary Name</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.bankAccountHolderName}</p>
                        </div>
                    </div>
                </div>
                <div className="h-full mb-[16px]" style={{ width: "504px" }}>
                    <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Certificate of Merit / Customer Profile</span></span>
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-md bg-bgBlue mb-[18px]">
                        <div>
                            <p className="text-sm text-gray-500">Major Clients</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.majorClients}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">{`Experience (in Years)`}</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{`${vendorDetails?.experience} Years`}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Specializations</p>
                            <p className="text-sm font-medium text-gray-800 w-[220px]">{vendorDetails?.specialization}</p>
                        </div>
                    </div>
                </div>
                <div className="h-full mb-[16px]" style={{ width: "504px" }}>
                    <div className="text-[14px] mb-[8px]" style={{ color: "gray" }}>Supporting documents</div>
                    <ViewTable columns={["attachmentComponent", "type"]} columnLabels={{ attachmentComponent: "Attachment", type: "Type" }} items={vendorDocuments} />
                </div>
            </>}
        </div>
    )
}

export default VendorDetailLeft;