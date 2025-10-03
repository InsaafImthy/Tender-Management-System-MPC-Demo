import React, { useEffect, useState } from "react";
import { TableCloseIcon } from "../../../utils/Icons";
import { Select } from "antd";

interface RfpAttachmentsProps {
    documentTypes:any[]
    attachments: any[]
    setAttachments: React.Dispatch<React.SetStateAction<any[]>>;
    setAttachmentsToDelete: React.Dispatch<React.SetStateAction<string[]>>;
}

interface TableRow {
    attachment: File | null;
    type: string
}

const RfpAttachments: React.FC<RfpAttachmentsProps> = ({
    documentTypes,
    attachments,
    setAttachments,
    setAttachmentsToDelete
}) => {
    const [tableData, setTableData] = useState<any[]>([]);

    const [isAdding, setIsAdding] = useState(false);
    const [newRow, setNewRow] = useState<any>({
        type: 0,
        attachment: null
    });
    
    const [errors, setErrors] = useState({
        type: false,
        attachment: false,
    });



    const syncToParent = (updatedData: any[]) => {
        setTableData(updatedData);
        setAttachments(updatedData)
    };

    const validateRow = (): boolean => {
        const hasErrors = {
            type: !newRow.type,
            attachment: !newRow.attachment,
        };
        setErrors(hasErrors);
        return !Object.values(hasErrors).some((error) => error);
    };

    const confirmNewRow = () => {
        if (validateRow()) {
            const updatedData = [...tableData, { ...newRow }];
            syncToParent(updatedData);
            setNewRow({ type: 0, attachment: null });
            setIsAdding(false);
        }
    };

    const deleteTableRow = (index: number) => {
        const updatedData = tableData.filter((_, i) => i !== index);
        if (tableData[index].id) setAttachmentsToDelete(x => ([...x, tableData[index].id as string]))
        syncToParent(updatedData);
    };

    const updateNewRowData = (field: keyof TableRow, value: string | File | null) => {
        setNewRow((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        setTableData(attachments);
    }, [attachments])

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Attachments</h2>
                        <p className="text-gray-600 mt-1">Upload supporting documents for your RFP</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="w-full rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-gray-700 font-semibold uppercase tracking-wider">Attachment</th>
                                    <th className="px-6 py-4 text-gray-700 font-semibold uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-gray-700 font-semibold uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row: any, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 hover:bg-blue-50 group relative transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4">
                                            {row.attachment ? (
                                                <a
                                                    className="text-blue-500 underline cursor-pointer"
                                                    href={
                                                        row.attachment instanceof File
                                                            ? URL.createObjectURL(row.attachment) // Create a temporary URL for a newly uploaded file
                                                            : row.attachment // Use existing URL if already saved
                                                    }
                                                    download={row.attachment instanceof File ? row.attachment.name : row.attachment.name}
                                                >
                                                    {row.attachment.name}
                                                </a>
                                            ) : (
                                                "No file"
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                {documentTypes?.find(dt=>dt.id == row.type)?.documentTypeName || 'Unknown Type'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => deleteTableRow(index)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                                                title="Delete attachment"
                                            >
                                                <TableCloseIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Row for adding a new entry */}
                                {isAdding && (
                                    <tr className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    updateNewRowData("attachment", e.target.files?.[0] || null)
                                                }
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.attachment ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {errors.attachment && (
                                                <p className="text-red-500 text-xs">Attachment is required</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Select 
                                                value={newRow.type || "select type"} 
                                                className="w-full" 
                                                options={documentTypes?.map((item:any)=>({ label: item?.documentTypeName, value: item?.id }))} 
                                                onChange={(value) => updateNewRowData("type", value)}
                                                placeholder="Select document type"
                                            />
                                            {errors.type && (
                                                <p className="text-red-500 text-xs">Vendor name should be alphabets</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={confirmNewRow}
                                                    className="inline-flex items-center justify-center w-10 h-10 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                                    title="Save attachment"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAdding(false)}
                                                    className="inline-flex items-center justify-center w-10 h-10 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                                    title="Cancel"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Row with Add button */}
                                {!isAdding && (
                                    <tr className="border-t-2 border-dashed border-gray-300 bg-gray-50">
                                        <td colSpan={3} className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsAdding(true)}
                                                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                <span className="mr-2">+</span>
                                                Add Attachment
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RfpAttachments;
